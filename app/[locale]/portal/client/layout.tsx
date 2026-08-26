"use client";

import type { ReactNode } from "react";
import PortalShell from "@/components/portal/PortalShell";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="client">{children}</PortalShell>;
}
