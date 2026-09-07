"use client";

import { useTranslations } from "next-intl";
import { getRetentionOverview } from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "@/components/portal/DataState";
import { IconAlert, IconUsers, IconTrendingUp, IconArrowRight } from "@/components/icons";

const EMPTY = { atRisk: 0, churnedThisMonth: 0, retainedPct: 0, atRiskClients: [], upsell: [] };

export default function AdminRetention() {
  const t = useTranslations("admin.retention");
  const res = useResourceOne(getRetentionOverview, []);
  const d = res.data ?? EMPTY;

  return (
    <>
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("title")}</b></div>
        {res.status === "loading" ? (
          <Skeleton rows={3} />
        ) : (
          <>
            <div className="castat">
              <div className="castat__c"><span className="castat__i castat__i--bad"><IconAlert /></span><b>{d.atRisk}</b><span>{t("atRisk")}</span></div>
              <div className="castat__c"><span className="castat__i"><IconUsers /></span><b>{d.churnedThisMonth}</b><span>{t("churned")}</span></div>
              <div className="castat__c"><span className="castat__i castat__i--ok"><IconTrendingUp /></span><b>{d.retainedPct}%</b><span>{t("retained")}</span></div>
            </div>
          </>
        )}
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h"><b>{t("atRiskTitle")}</b></div>
          {res.status === "loading" ? <Skeleton rows={2} /> : !d.atRiskClients.length ? (
            <p className="advmuted">{t("noRisk")}</p>
          ) : (
            <div className="alist">
              {d.atRiskClients.map((c, i) => (
                <div className="creq" key={i}>
                  <span className="creq__st" />
                  <div className="creq__m"><b>{c.name || c.phone}</b><span>{[c.reason, c.lastActive].filter(Boolean).join(" · ")}</span></div>
                  <button className="btn btn--soft btn--sm" type="button">{t("winBack")}</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ppanel">
          <div className="ppanel__h"><b>{t("upsellTitle")}</b></div>
          {res.status === "loading" ? <Skeleton rows={2} /> : !d.upsell.length ? (
            <p className="advmuted">{t("noUpsell")}</p>
          ) : (
            <div className="alist">
              {d.upsell.map((u, i) => (
                <div className="creq" key={i}>
                  <span className="creq__st" />
                  <div className="creq__m"><b>{u.name}</b><span>{u.suggestion}</span></div>
                  <IconArrowRight />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
