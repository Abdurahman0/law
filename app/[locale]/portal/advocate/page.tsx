"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import StatGrid from "@/components/portal/StatGrid";
import SellerDashboard from "@/components/portal/SellerDashboard";
import { useSellerCabinet } from "@/components/portal/SellerCabinet";
import { IconBolt, IconArrowRight } from "@/components/icons";

export default function AdvocateDashboard() {
  const t = useTranslations("portal.advocate.dashboard");
  const { session } = useAuth();
  const cabinet = useSellerCabinet();
  const completeness = session?.completeness ?? 0;

  return (
    <>
      <div className="advhero">
        <div className="advhero__t">
          <span className="advhero__k">{t("kicker")}</span>
          <h2 className="psec-h" style={{ color: "#fff" }}>{t("hi", { name: session?.name ?? "" })}</h2>
          <p>{t("sub")}</p>
        </div>
        <div className="advhero__done">
          <div className="ring" style={{ "--v": `${completeness}%` } as CSSProperties}>
            <b>{completeness}%</b>
          </div>
          <div>
            <b>{t("completeness")}</b>
            <span>{t("completenessHint")}</span>
            <Link href="/portal/advocate/profile" className="btn btn--glass btn--sm" style={{ marginTop: 8 }}>
              {t("completeCta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Module 10 dashboard: «Bugun» / «Moliyaviy holat» / «Yangi keyslar». */}
      <SellerDashboard role="advocate" />

      {cabinet.data?.limitedAccess ? null : (
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("performance")}</b>
          </div>
          <StatGrid variant="performance" emptyTitle={t("performanceEmpty")} emptyText={t("performanceEmptyText")} />
        </div>
      )}

      <div className="ppanel advboost">
        <div className="ppanel__h">
          <b>{t("boostTitle")}</b>
        </div>
        <p className="advmuted">{t("boostSub")}</p>
        <Link href="/portal/advocate/promotion" className="btn btn--grad btn--full" style={{ marginTop: 14 }}>
          <IconBolt />
          {t("boostCta")}
        </Link>
        <Link href="/portal/advocate/subscription" className="btn btn--line btn--full" style={{ marginTop: 10 }}>
          {t("upgradeCta")}
          <IconArrowRight />
        </Link>
      </div>
    </>
  );
}
