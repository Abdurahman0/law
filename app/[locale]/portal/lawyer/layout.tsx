"use client";

import type { ReactNode } from "react";
import PortalShell from "@/components/portal/PortalShell";

export default function LawyerLayout({ children }: { children: ReactNode }) {
  return <PortalShell role="lawyer">{children}</PortalShell>;
}
