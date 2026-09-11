"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSellerCabinet, type SellerCabinet } from "@/lib/services/backend";
import type { ResStatus } from "@/lib/useResource";

// Seller cabinet (GET /lawyers/me/cabinet) loaded once by the portal shell and
// shared with the lawyer/advocate pages, so they don't each fetch on first load.
export type CabinetState = { status: ResStatus; data: SellerCabinet | null };

const Ctx = createContext<CabinetState>({ status: "loading", data: null });
export const CabinetProvider = Ctx.Provider;

export function useSellerCabinet(): CabinetState {
  return useContext(Ctx);
}

// Loads the cabinet and reloads it whenever refreshKey changes (the pathname),
// keeping the previous data meanwhile so the shell doesn't flash.
export function useCabinetLoader(enabled: boolean, refreshKey: string): CabinetState {
  const [state, setState] = useState<CabinetState>({ status: "loading", data: null });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    getSellerCabinet()
      .then((data) => alive && setState({ status: "ready", data }))
      .catch(() => alive && setState((s) => (s.data ? s : { status: "error", data: null })));
    return () => {
      alive = false;
    };
  }, [enabled, refreshKey]);
  return state;
}
