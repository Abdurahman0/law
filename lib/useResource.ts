"use client";

import { useEffect, useState } from "react";

export type ResStatus = "loading" | "ready" | "error";
export type Resource<T> = { status: ResStatus; data: T[] };

// Load a backend list. No mock fallback — callers render loading / empty /
// error states from the returned status.
export function useResource<T>(
  fetcher: () => Promise<T[]>,
  deps: unknown[] = [],
): Resource<T> {
  const [res, setRes] = useState<Resource<T>>({ status: "loading", data: [] });
  useEffect(() => {
    let alive = true;
    setRes({ status: "loading", data: [] });
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
  useEffect(() => {
    let alive = true;
    setRes({ status: "loading", data: null });
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
