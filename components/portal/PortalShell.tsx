"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth, hasAdminAccess, type Role } from "@/lib/auth";
import { initials } from "@/lib/lawyers";
import LanguageSwitcher from "../LanguageSwitcher";
import {
  IconLogo,
  IconGrid,
  IconBriefcase,
  IconFileText,
  IconDocLines,
  IconCalendar,
  IconUsers,
  IconChat,
  IconSparkle,
  IconUser,
  IconCard,
  IconShield,
  IconGift,
  IconLogout,
  IconMenu,
  IconClose,
  IconBolt,
  IconStar,
  IconBuilding,
} from "../icons";

type SvgC = ComponentType<{ className?: string }>;
type NavItem = { href: string; key: string; Icon: SvgC };

const LAWYER_NAV: NavItem[] = [
  { href: "/portal/lawyer", key: "dashboard", Icon: IconGrid },
  { href: "/portal/lawyer/marketplace", key: "marketplace", Icon: IconBriefcase },
  { href: "/portal/lawyer/cases", key: "cases", Icon: IconFileText },
  { href: "/portal/lawyer/calendar", key: "calendar", Icon: IconCalendar },
  { href: "/portal/lawyer/clients", key: "clients", Icon: IconUsers },
  { href: "/portal/lawyer/documents", key: "documents", Icon: IconDocLines },
  { href: "/portal/lawyer/chat", key: "chat", Icon: IconChat },
  { href: "/portal/lawyer/ai", key: "ai", Icon: IconSparkle },
  { href: "/portal/lawyer/promotion", key: "promotion", Icon: IconBolt },
  { href: "/portal/lawyer/subscription", key: "subscription", Icon: IconStar },
];

const ADVOCATE_NAV: NavItem[] = [
  { href: "/portal/advocate", key: "dashboard", Icon: IconGrid },
  { href: "/portal/advocate/opportunities", key: "opportunities", Icon: IconBriefcase },
  { href: "/portal/advocate/cases", key: "cases", Icon: IconFileText },
  { href: "/portal/advocate/messages", key: "messages", Icon: IconChat },
  { href: "/portal/advocate/organization", key: "organization", Icon: IconBuilding },
  { href: "/portal/advocate/profile", key: "profile", Icon: IconUser },
  { href: "/portal/advocate/promotion", key: "promotion", Icon: IconBolt },
  { href: "/portal/advocate/subscription", key: "subscription", Icon: IconStar },
];

const CLIENT_NAV: NavItem[] = [
  { href: "/portal/client", key: "dashboard", Icon: IconGrid },
  { href: "/portal/client/services", key: "services", Icon: IconBriefcase },
  { href: "/portal/client/documents", key: "documents", Icon: IconDocLines },
  { href: "/portal/client/cases", key: "cases", Icon: IconFileText },
  { href: "/portal/client/messages", key: "messages", Icon: IconChat },
  { href: "/portal/client/ai", key: "ai", Icon: IconSparkle },
  { href: "/portal/client/lawyers", key: "lawyers", Icon: IconUser },
  { href: "/portal/client/subscription", key: "subscription", Icon: IconShield },
  { href: "/portal/client/payments", key: "payments", Icon: IconCard },
  { href: "/portal/client/gifts", key: "gifts", Icon: IconGift },
  { href: "/portal/client/profile", key: "profile", Icon: IconUser },
];

export default function PortalShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const t = useTranslations("portal");
  const { session, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Guard: require a session; keep role and route in sync.
  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
    } else if (session.role !== role) {
      router.replace(`/portal/${session.role}`);
    }
  }, [ready, session, role, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !session || session.role !== role) return null;

  const nav =
    role === "advocate" ? ADVOCATE_NAV : role === "lawyer" ? LAWYER_NAV : CLIENT_NAV;
  const active = nav
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const title = active ? t(`sidebar.${role}.${active.key}`) : t("metaTitle");

  return (
    <div className="portal">
      <div
        className={`psb__scrim${open ? " on" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`psb${open ? " on" : ""}`}>
        <div className="psb__logo">
          <span className="logo__m">
            <IconLogo />
          </span>
          LexGo
          <span className="psb__role">
            {t(
              `common.role${role === "advocate" ? "Advocate" : role === "lawyer" ? "Lawyer" : "Client"}`,
            )}
          </span>
        </div>
        <nav className="psb__nav">
          {nav.map(({ href, key, Icon }) => {
            const on = active?.href === href;
            return (
              <Link key={href} href={href} className={`psb__link${on ? " on" : ""}`}>
                <Icon />
                {t(`sidebar.${role}.${key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="psb__foot">
          {hasAdminAccess(session) ? (
            <Link href="/admin" className="psb__link">
              <IconShield />
              {t("common.admin")}
            </Link>
          ) : null}
          <button className="psb__link" type="button" onClick={logout}>
            <IconLogout />
            {t("common.logout")}
          </button>
        </div>
      </aside>

      <div className="pmain">
        <header className="ptop">
          <button
            className="ptop__burger"
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
          <h1>{title}</h1>
          <div className="ptop__sp">
            <LanguageSwitcher />
            <div className="ptop__user">
              <span className="ptop__av">{initials(session.name || "U")}</span>
              <span>{session.name}</span>
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
