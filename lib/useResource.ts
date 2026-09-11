"use client";

import { useEffect, useState } from "react";

export type ResStatus = "loading" | "ready" | "error";
export type Resource<T> = { status: ResStatus; data: T[] };

const sameDeps = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

// Load a backend list. No mock fallback — callers render loading / empty /
// error states from the returned status.
export function useResource<T>(
  fetcher: () => Promise<T[]>,
  deps: unknown[] = [],
): Resource<T> {
  const [res, setRes] = useState<Resource<T>>({ status: "loading", data: [] });
  // Back to "loading" as soon as the deps change (during render, not in the
  // effect, so there is no extra cascading render).
  const [prevDeps, setPrevDeps] = useState(deps);
  if (!sameDeps(prevDeps, deps)) {
    setPrevDeps(deps);
    setRes({ status: "loading", data: [] });
  }
  useEffect(() => {
    let alive = true;
    fetcher()
      .then((d) => alive && setRes({ status: "ready", data: d }))
      .catch(() => alive && setRes({ status: "error", data: [] }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return res;
}

// Load a single backend object (e.g. /auth/me). null while loading / on error.
export function useResourceOne<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): { status: ResStatus; data: T | null } {
  const [res, setRes] = useState<{ status: ResStatus; data: T | null }>({
    status: "loading",
    data: null,
  });
  const [prevDeps, setPrevDeps] = useState(deps);
  if (!sameDeps(prevDeps, deps)) {
    setPrevDeps(deps);
    setRes({ status: "loading", data: null });
  }
  useEffect(() => {
    let alive = true;
    fetcher()
      .then((d) => alive && setRes({ status: "ready", data: d }))
      .catch(() => alive && setRes({ status: "error", data: null }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return res;
}
