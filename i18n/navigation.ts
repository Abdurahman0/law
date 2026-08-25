import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation helpers. Always import Link/useRouter/usePathname
// from here (not from next/link) so the active locale prefix is preserved.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
