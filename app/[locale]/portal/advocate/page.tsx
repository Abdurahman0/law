"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { listOrders } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import {
  IconBolt,
  IconArrowRight,
  IconClock,
  IconMapPin,
  IconTrendingUp,
  IconBriefcase,
} from "@/components/icons";

export default function AdvocateDashboard() {
  const t = useTranslations("portal.advocate.dashboard");
  const tc = useTranslations("portal.common");
  const { session } = useAuth();
  const res = useResource(listOrders, []);
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
          <div className="ring" style={{ "--v": `${completeness}%` } as React.CSSProperties}>
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

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("performance")}</b>
        </div>
        <EmptyState icon={<IconTrendingUp />} title={t("performanceEmpty")} text={t("performanceEmptyText")} />
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("opportunities")}</b>
            <Link href="/portal/advocate/opportunities">{tc("viewAll")}</Link>
          </div>
          <p className="advmuted" style={{ marginBottom: 12 }}>{t("opportunitiesSub")}</p>
          {res.status === "loading" ? (
            <Skeleton rows={3} />
          ) : !res.data.length ? (
            <EmptyState icon={<IconBriefcase />} title={t("opportunitiesEmpty")} text={t("opportunitiesEmptyText")} />
          ) : (
            <div className="pcards">
              {res.data.slice(0, 3).map((o) => (
                <div className="oppc" key={o.id}>
                  <div className="oppc__h">
                    <span className="oppc__match">{o.status}</span>
                    <span className="oppc__ago"><IconClock />{o.createdAt}</span>
                  </div>
                  <b>{o.title}</b>
                  <small>
                    <IconMapPin />
                    {[o.region, o.budget].filter(Boolean).join(" · ")}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </div>
    </>
  );
}
