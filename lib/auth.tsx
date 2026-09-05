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
import { normUzPhone } from "./phone";
import type { PlanTier, ProfessionalProfile, RegistrationDraft } from "./types";
import { scoreCompleteness, registerAccount } from "./services/registration";
import {
  apiLogin,
  apiMe,
  registerStart,
  registerVerify,
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

// Our UI has client|lawyer|advocate; the backend has client|yurist|advokat
// (+ advokat_tashkiloti and internal staff roles). Map lawyer↔yurist,
// advocate↔advokat (advokat_tashkiloti also lands in the advocate portal).
const toBackendRole = (r: Role): BackendRole =>
  r === "client" ? "client" : r === "lawyer" ? "yurist" : "advokat";
const fromBackendRole = (r: BackendRole): Role =>
  r === "yurist" ? "lawyer" : r === "advokat" || r === "advokat_tashkiloti" ? "advocate" : "client";

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (
    phone: string,
    password: string,
    fallback?: { role: Role; name: string },
  ) => Promise<Session>;
  startRegistration: (draft: RegistrationDraft) => Promise<{ verificationId: string; demoOtp: string }>;
  register: (
    draft: RegistrationDraft,
    verificationId: string,
    code: string,
  ) => Promise<Session | { pending: true; message: string }>;
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
    async (rawPhone: string, password: string, fallback?: { role: Role; name: string }) => {
      const phone = normUzPhone(rawPhone);
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

  // Step 1: request an OTP (backend returns demo_otp until SMS is live).
  const startRegistration = useCallback(async (draft: RegistrationDraft) => {
    const role = (draft.accountType ?? "client") as Role;
    try {
      const r = await registerStart({
        role: toBackendRole(role),
        name: draft.profile.name,
        firstName: draft.profile.firstName,
        lastName: draft.profile.lastName,
        phone: normUzPhone(draft.phone),
        password: draft.password,
      });
      return { verificationId: r.verificationId, demoOtp: r.demoOtp };
    } catch (e) {
      if (e instanceof ApiError && !isOffline(e)) throw e;
      // Backend unreachable → offline demo OTP.
      return { verificationId: "", demoOtp: "123456" };
    }
  }, []);

  // Step 2: verify the OTP, create the session, then upsert the seller profile.
  const register = useCallback(
    async (draft: RegistrationDraft, verificationId: string, code: string) => {
      const role = (draft.accountType ?? "client") as Role;
      const completeness = scoreCompleteness(role, draft.profile);
      const finish = (s: Session) => {
        persist(s);
        return s;
      };
      // Offline path (no verification id).
      if (!verificationId) {
        const acc = await registerAccount(draft);
        return finish({
          role, name: acc.name, phone: acc.phone, id: acc.id,
          plan: "free", completeness, profile: draft.profile,
        });
      }
      const res = await registerVerify(verificationId, code);
      // Seller roles are approval-based: no account/token yet — an admin must
      // accept the request. Surface a pending state instead of a session.
      if (res.pending) {
        return {
          pending: true as const,
          message: res.message || "Ro'yxatdan o'tish so'rovi adminga yuborildi",
        };
      }
      const { token, user } = res;
      setToken(token);
      return finish({
        role,
        name: user.name || draft.profile.name,
        phone: user.phone || normUzPhone(draft.phone),
        id: user.id,
        plan: "free",
        completeness,
        profile: draft.profile,
        token,
        roles: user.roles,
        permissions: user.permissions,
      });
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
    <Ctx.Provider value={{ session, ready, login, startRegistration, register, update, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

// Only advocates working in the call center may INITIATE audio/video calls.
// Everyone else (clients, regular lawyers/advocates) can still receive/join.
export function canMakeCalls(s: Session | null): boolean {
  if (!s) return false;
  return (s.roles ?? []).some((r) => r.toLowerCase().includes("call_center"));
}

// Admin access = an admin/superadmin role or any granted permission.
export function hasAdminAccess(s: Session | null): boolean {
  if (!s) return false;
  const roles = (s.roles ?? []).map((r) => r.toLowerCase());
  if (roles.some((r) => r === "superadmin" || r === "admin")) return true;
  return (s.permissions ?? []).length > 0;
}
