"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconLogo, IconCheck } from "../icons";

export default function AuthSplit({ children }: { children: ReactNode }) {
  const t = useTranslations("auth");
  const feats = t.raw("features") as string[];
  const stats = [
    { n: t("stat1n"), l: t("stat1l") },
    { n: t("stat2n"), l: t("stat2l") },
    { n: t("stat3n"), l: t("stat3l") },
  ];
  return (
    <div className="auth">
      <aside className="auth__brand">
        <span className="auth__mesh" />
        <div className="auth__brand-in">
          <Link href="/" className="auth__logo">
            <span className="logo__m">
              <IconLogo />
            </span>
            LexGo
          </Link>
          <div className="auth__copy">
            <h2 className="auth__h">{t("headline")}</h2>
            <p className="auth__p">{t("sub")}</p>
            <ul className="auth__feats">
              {feats.map((f, i) => (
                <li key={i}>
                  <IconCheck />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="auth__stats">
            {stats.map((s, i) => (
              <div key={i}>
                <b>{s.n}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="auth__main">
        <div className="auth__main-in">{children}</div>
      </main>
    </div>
  );
}
