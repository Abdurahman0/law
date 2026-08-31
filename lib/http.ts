// Shared HTTP core for the LexGo backend (see FRONTEND_API.md / MOBILE_API.md).
// Same-origin proxy path (app/api/backend) avoids browser CORS; the deployment
// sets BACKEND_ORIGIN. Every request carries the bearer token when present.
import { getToken } from "./client";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(status: number, detail?: string) {
    super(detail || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// True when the backend refused an AI reply because the guest IP limit is spent
// ("AI limit tugadi. ... login qiling.") — or auth/quota status codes.
export function isLimitError(e: unknown): boolean {
  if (!(e instanceof ApiError)) return false;
  if (e.detail && /limit|лимит/i.test(e.detail)) return true;
  return e.status === 401 || e.status === 402 || e.status === 429;
}

// True when the backend itself is unreachable (dev/preview against a LAN IP).
// Callers use this to fall back to local mock data gracefully.
export function isOffline(e: unknown): boolean {
  if (e instanceof ApiError) return e.status === 502 || e.status === 0;
  return true; // network / fetch throw
}

export async function http<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, "network_error");
  }
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const t = await res.text();
      if (t) {
        const j = JSON.parse(t);
        if (typeof j?.detail === "string") detail = j.detail;
      }
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function absUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Small dict helpers shared by normalizers.
export type Dict = Record<string, unknown>;
export const asDict = (v: unknown): Dict =>
  v && typeof v === "object" ? (v as Dict) : {};
export const asStr = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);
export const asNum = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
};
export const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

// Run a backend fetch, falling back to local mock data when the backend is
// unreachable or errors — keeps the app fully usable before the API is live.
export async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const data = await fetcher();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}
