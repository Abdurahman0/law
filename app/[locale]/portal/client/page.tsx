"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { CLIENT_ORDERS } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";
import { IconSparkle, IconShield } from "@/components/icons";

export default function ClientDashboard() {
  const t = useTranslations("portal.client.dashboard");
  const tc = useTranslations("portal.common");
  const { session } = useAuth();
  const active = CLIENT_ORDERS.filter((o) => o.status !== "completed");

  return (
    <>
      <div className="ppanel" style={{ background: "var(--grad-dark)", color: "#fff" }}>
        <h2 className="psec-h" style={{ color: "#fff" }}>
          {t("hi", { name: session?.name ?? "" })}
        </h2>
        <p style={{ margin: "8px 0 16px", color: "#B7CDEC", fontSize: ".95rem" }}>
          {t("quickHelp")}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/chat" className="btn btn--grad">
            <IconSparkle />
            {t("quickHelpCta")}
          </Link>
          <Link href="/portal/client/lawyers" className="btn btn--glass">
            {t("urgentCta")}
          </Link>
        </div>
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("activeOrders")}</b>
            <Link href="/portal/client/cases">{tc("viewAll")}</Link>
          </div>
          {active.map((o) => (
            <div className="prow" key={o.id}>
              <div className="prow__m">
                <b>{o.service}</b>
                <span>
                  {o.lawyer} · {o.date}
                </span>
              </div>
              <StatusPill kind="status" value={o.status} />
            </div>
          ))}
        </div>

        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("subscription")}</b>
            <Link href="/portal/client/subscription">{tc("viewAll")}</Link>
          </div>
          <div className="prow">
            <span className="prow__i" style={{ background: "var(--grad)", color: "#fff" }}>
              <IconShield />
            </span>
            <div className="prow__m">
              <b>{t("subActive")}</b>
              <span>LexGo</span>
            </div>
          </div>
          <Link
            href="/services"
            className="btn btn--line btn--full"
            style={{ marginTop: 12 }}
          >
            {t("browse")}
          </Link>
        </div>
      </div>
    </>
  );
}
