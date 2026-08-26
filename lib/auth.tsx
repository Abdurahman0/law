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

export type Role = "client" | "lawyer";
export type Session = {
  role: Role;
  name: string;
  phone?: string;
  id: string;
};

const KEY = "lexgo_session";

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (s: Omit<Session, "id">) => Session;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

// NOTE: mock auth (no auth backend in the spec yet). Session is kept in
// localStorage and tied to the anonymous client id. Replace login()/logout()
// with real API calls once the backend exposes auth.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback((s: Omit<Session, "id">) => {
    const full: Session = { ...s, id: getClientId() };
    localStorage.setItem(KEY, JSON.stringify(full));
    setSession(full);
    return full;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  return (
    <Ctx.Provider value={{ session, ready, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
