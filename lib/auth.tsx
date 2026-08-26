"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setToken } from "./client";
import {
  apiLogin,
  apiRegister,
  apiMe,
  type BackendRole,
} from "./api";

export type Role = "client" | "lawyer";
export type Session = {
  role: Role;
  name: string;
  phone: string;
  id: string;
  token: string;
};

const KEY = "lexgo_session";

// Our UI uses client|lawyer; the backend uses client|advokat (FRONTEND_AUTH.md).
const toBackendRole = (r: Role): BackendRole =>
  r === "lawyer" ? "advokat" : "client";
const fromBackendRole = (r: BackendRole): Role =>
  r === "advokat" ? "lawyer" : "client";

type AuthCtx = {
  session: Session | null;
  ready: boolean;
  login: (phone: string, password: string) => Promise<Session>;
  register: (input: {
    role: Role;
    name: string;
    phone: string;
    password: string;
  }) => Promise<Session>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((s: Session | null) => {
    if (s) {
      localStorage.setItem(KEY, JSON.stringify(s));
      setToken(s.token);
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
    if (stored?.token) {
      setToken(stored.token);
      setSession(stored);
      // Refresh profile/role in the background; keep the stored session if the
      // backend is unreachable, drop it only on an explicit auth rejection.
      apiMe()
        .then((u) =>
          persist({
            ...stored!,
            id: u.id || stored!.id,
            name: u.name || stored!.name,
            phone: u.phone || stored!.phone,
            role: fromBackendRole(u.role),
          }),
        )
        .catch((e) => {
          if (e && typeof e === "object" && "status" in e && e.status === 401) {
            persist(null);
          }
        });
    }
    setReady(true);
  }, [persist]);

  const login = useCallback(
    async (phone: string, password: string) => {
      const { token, user } = await apiLogin(phone, password);
      const s: Session = {
        id: user.id,
        role: fromBackendRole(user.role),
        name: user.name,
        phone: user.phone || phone,
        token,
      };
      persist(s);
      return s;
    },
    [persist],
  );

  const register = useCallback(
    async (input: {
      role: Role;
      name: string;
      phone: string;
      password: string;
    }) => {
      const { token, user } = await apiRegister({
        role: toBackendRole(input.role),
        name: input.name,
        phone: input.phone,
        password: input.password,
      });
      const s: Session = {
        id: user.id,
        role: fromBackendRole(user.role),
        name: user.name || input.name,
        phone: user.phone || input.phone,
        token,
      };
      persist(s);
      return s;
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <Ctx.Provider value={{ session, ready, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
