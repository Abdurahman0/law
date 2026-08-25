import type { ReactNode } from "react";

// The real <html>/<body> live in app/[locale]/layout.tsx so the lang
// attribute and fonts can depend on the active locale. This root layout is a
// pass-through required by the App Router.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
