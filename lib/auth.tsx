"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getClientId, setToken } from "./client";
import { ApiError, isOffline } from "./http";
import type { PlanTier, ProfessionalProfile, RegistrationDraft } from "./types";
import { scoreCompleteness, registerAccount } from "./services/registration";
import {
  apiLogin,
  apiRegister,
  apiMe,
  upsertMyLawyer,
  putMyServices,
  type BackendRole,
} from "./services/backend";

export type Role = "client" | "lawyer" | "advocate";
export type Session = {
  role: Role;
  name: string;
  phone: string;
  id: string;
  plan: PlanTier;
  completeness: number;
  profile?: ProfessionalProfile;
  token?: string;
  roles?: string[];
  permissions?: string[];
};

const KEY = "lexgo_session";

// Our UI has client|lawyer|advocate; the backend has client|advokat. Lawyer and
// advocate both register as advokat; we keep the finer role locally so the
// portal matches the user's choice. A fresh advokat login lands in advocate.
const toBackendRole = (r: Role): BackendRole =>
  r === "client" ? "client" : "advokat";
const fromBackendRole = (r: BackendRole): Role =>
  r === "advokat" ? "advocate" : "client";

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (
    phone: string,
    password: string,
    fallback?: { role: Role; name: string },
  ) => Promise<Session>;
  register: (draft: RegistrationDraft, password: string) => Promise<Session>;
  update: (patch: Partial<Session>) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((s: Session | null) => {
    if (s) {
      localStorage.setItem(KEY, JSON.stringify(s));
      setToken(s.token ?? null);
    } else {
      localStorage.removeItem(KEY);
      setToken(null);
    }
    setSession(s);
  }, []);

  useEffect(() => {
    let stored: Session | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) stored = JSON.parse(raw) as Session;
    } catch {
      /* ignore */
    }
    if (stored) {
      setToken(stored.token ?? null);
      setSession(stored);
      // Refresh roles/permissions in the background for real (tokened) sessions.
      if (stored.token) {
        apiMe()
          .then((u) =>
            persist({
              ...stored!,
              name: u.name || stored!.name,
              phone: u.phone || stored!.phone,
              roles: u.roles,
              permissions: u.permissions,
            }),
          )
          .catch((e) => {
            if (e instanceof ApiError && e.status === 401) persist(null);
          });
      }
    }
    setReady(true);
  }, [persist]);

  const login = useCallback(
    async (phone: string, password: string, fallback?: { role: Role; name: string }) => {
      try {
        const { token, user } = await apiLogin(phone, password);
        setToken(token);
        const s: Session = {
          role: fromBackendRole(user.role),
          name: user.name || fallback?.name || "",
          phone: user.phone || phone,
          id: user.id,
          plan: "free",
          completeness: user.role === "advokat" ? 60 : 100,
          token,
          roles: user.roles,
          permissions: user.permissions,
        };
        persist(s);
        return s;
      } catch (e) {
        // Real rejection (bad credentials) → surface it. Backend unreachable →
        // fall back to a local demo session so the app stays usable.
        if (e instanceof ApiError && !isOffline(e)) throw e;
        if (!fallback) throw e;
        const s: Session = {
          role: fallback.role,
          name: fallback.name,
          phone,
          id: getClientId(),
          plan: "free",
          completeness: fallback.role === "client" ? 100 : 45,
        };
        persist(s);
        return s;
      }
    },
    [persist],
  );

  const register = useCallback(
    async (draft: RegistrationDraft, password: string) => {
      const role = (draft.accountType ?? "client") as Role;
      const completeness = scoreCompleteness(role, draft.profile);
      try {
        const { token, user } = await apiRegister({
          role: toBackendRole(role),
          name: draft.profile.name,
          phone: draft.phone,
          password,
        });
        setToken(token);
        if (role !== "client") {
          try {
            await upsertMyLawyer(draft.profile);
            if (draft.profile.services.length) {
              await putMyServices(draft.profile.services);
            }
          } catch {
            /* profile upsert is best-effort */
          }
        }
        const s: Session = {
          role,
          name: user.name || draft.profile.name,
          phone: user.phone || draft.phone,
          id: user.id,
          plan: "free",
          completeness,
          profile: draft.profile,
          token,
          roles: user.roles,
          permissions: user.permissions,
        };
        persist(s);
        return s;
      } catch (e) {
        if (e instanceof ApiError && !isOffline(e)) throw e;
        // Backend unreachable → local demo account.
        const acc = await registerAccount(draft);
        const s: Session = {
          role,
          name: acc.name,
          phone: acc.phone,
          id: acc.id,
          plan: "free",
          completeness,
          profile: draft.profile,
        };
        persist(s);
        return s;
      }
    },
    [persist],
  );

  const update = useCallback((patch: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <Ctx.Provider value={{ session, ready, login, register, update, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

// Admin access = an admin/superadmin role or any granted permission.
export function hasAdminAccess(s: Session | null): boolean {
  if (!s) return false;
  const roles = (s.roles ?? []).map((r) => r.toLowerCase());
  if (roles.some((r) => r === "superadmin" || r === "admin")) return true;
  return (s.permissions ?? []).length > 0;
}
