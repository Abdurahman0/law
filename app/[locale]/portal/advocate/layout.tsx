"use client";

import type { ReactNode } from "react";
import PortalShell from "@/components/portal/PortalShell";

export default function AdvocateLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="advocate">{children}</PortalShell>;
}
