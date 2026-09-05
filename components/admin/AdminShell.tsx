"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth, hasAdminAccess } from "@/lib/auth";
import { initials } from "@/lib/lawyers";
import LanguageSwitcher from "../LanguageSwitcher";
import {
  IconLogo,
  IconGrid,
  IconBriefcase,
  IconStar,
  IconDocLines,
  IconShield,
  IconShieldCheck,
  IconChat,
  IconUsers,
  IconRocket,
  IconBolt,
  IconLogout,
  IconMenu,
  IconClose,
} from "../icons";

type SvgC = ComponentType<{ className?: string }>;
const NAV: { href: string; key: string; Icon: SvgC }[] = [
  { href: "/admin", key: "overview", Icon: IconGrid },
  { href: "/admin/services", key: "services", Icon: IconBriefcase },
  { href: "/admin/plans", key: "plans", Icon: IconStar },
  { href: "/admin/templates", key: "templates", Icon: IconDocLines },
  { href: "/admin/ads", key: "ads", Icon: IconRocket },
  { href: "/admin/roles", key: "roles", Icon: IconShield },
  { href: "/admin/leads", key: "leads", Icon: IconUsers },
  { href: "/admin/approvals", key: "approvals", Icon: IconShieldCheck },
  { href: "/admin/notifications", key: "notifications", Icon: IconChat },
  { href: "/admin/bootstrap", key: "bootstrap", Icon: IconBolt },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const { session, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isBootstrap = pathname === "/admin/bootstrap";
  const allowed = hasAdminAccess(session) || isBootstrap;

  useEffect(() => {
    if (!ready) return;
    if (!session && !isBootstrap) router.replace("/login");
    else if (session && !hasAdminAccess(session) && !isBootstrap)
      router.replace(`/portal/${session.role}`);
  }, [ready, session, router, isBootstrap]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready) return null;
  if (!allowed) return null;

  const active = NAV.slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const title = active ? t(`nav.${active.key}`) : t("title");

  return (
    <div className="portal">
      <div className={`psb__scrim${open ? " on" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`psb${open ? " on" : ""}`}>
        <div className="psb__logo">
          <span className="logo__m">
            <IconLogo />
          </span>
          LexGo
          <span className="psb__role">{t("badge")}</span>
        </div>
        <nav className="psb__nav">
          {NAV.map(({ href, key, Icon }) => {
            const on = active?.href === href;
            return (
              <Link key={href} href={href} className={`psb__link${on ? " on" : ""}`}>
                <Icon />
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="psb__foot">
          <Link href={session ? `/portal/${session.role}` : "/portal/client"} className="psb__link">
            <IconGrid />
            {t("backToPortal")}
          </Link>
          <button className="psb__link" type="button" onClick={logout}>
            <IconLogout />
            {t("logout")}
          </button>
        </div>
      </aside>

      <div className="pmain">
        <header className="ptop">
          <button className="ptop__burger" type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            {open ? <IconClose /> : <IconMenu />}
          </button>
          <h1>{title}</h1>
          <div className="ptop__sp">
            <LanguageSwitcher />
            <div className="ptop__user">
              <span className="ptop__av">{initials(session?.name || "A")}</span>
              <span>{session?.name || t("badge")}</span>
            </div>
          </div>
        </header>
        <div className="pbody">
          <div className="pbody__in">{children}</div>
        </div>
      </div>
    </div>
  );
}
