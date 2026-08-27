"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getClientId } from "./client";
import type {
  PlanTier,
  ProfessionalProfile,
  RegistrationDraft,
} from "./types";
import { scoreCompleteness } from "./services/registration";
import type { RegisteredAccount } from "./services/registration";

export type Role = "client" | "lawyer" | "advocate";
export type Session = {
  role: Role;
  name: string;
  phone: string;
  id: string;
  plan: PlanTier;
  completeness: number;
  profile?: ProfessionalProfile;
};

const KEY = "lexgo_session";

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (s: { role: Role; name: string; phone?: string }) => Session;
  register: (draft: RegistrationDraft, account: RegisteredAccount) => Session;
  update: (patch: Partial<Session>) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

// NOTE: mock auth (backend auth not wired yet). Session is kept in localStorage
// and tied to the anonymous client id. Swap login()/register() for real API
// calls once the backend exposes auth.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((s: Session | null) => {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
    setSession(s);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback(
    (s: { role: Role; name: string; phone?: string }) => {
      const full: Session = {
        role: s.role,
        name: s.name,
        phone: s.phone ?? "",
        id: getClientId(),
        plan: "free",
        completeness: s.role === "client" ? 100 : 40,
      };
      persist(full);
      return full;
    },
    [persist],
  );

  const register = useCallback(
    (draft: RegistrationDraft, account: RegisteredAccount) => {
      const full: Session = {
        role: account.accountType,
        name: account.name,
        phone: account.phone,
        id: account.id,
        plan: "free",
        completeness: scoreCompleteness(account.accountType, draft.profile),
        profile: draft.profile,
      };
      persist(full);
      return full;
    },
    [persist],
  );

  const update = useCallback(
    (patch: Partial<Session>) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

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
