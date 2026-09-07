"use client";

import { useTranslations } from "next-intl";
import { getCeoDashboard } from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "@/components/portal/DataState";
import { IconCard, IconStar, IconUsers, IconTarget, IconTrendingUp } from "@/components/icons";

const EMPTY = { revenue: 0, revenueDeltaPct: 0, mrr: 0, users: 0, activeUsers: 0, conversionPct: 0, funnel: [], channels: [], revenueTrend: [] };
const som = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function AdminCeo() {
  const t = useTranslations("admin.ceo");
  const res = useResourceOne(getCeoDashboard, []);
  const d = res.data ?? EMPTY;
  const trendMax = Math.max(1, ...d.revenueTrend.map((x) => x.value));
  const funnelMax = Math.max(1, ...d.funnel.map((x) => x.value));

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b></div>
      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : (
        <>
          <div className="castat">
            <div className="castat__c"><span className="castat__i"><IconCard /></span><b>{som(d.revenue)}</b><span>{t("revenue")} · {d.revenueDeltaPct >= 0 ? "+" : ""}{d.revenueDeltaPct}%</span></div>
            <div className="castat__c"><span className="castat__i castat__i--ok"><IconTrendingUp /></span><b>{som(d.mrr)}</b><span>{t("mrr")}</span></div>
            <div className="castat__c"><span className="castat__i"><IconUsers /></span><b>{d.users}</b><span>{t("users")} · {d.activeUsers} {t("active")}</span></div>
            <div className="castat__c"><span className="castat__i"><IconTarget /></span><b>{d.conversionPct}%</b><span>{t("conversion")}</span></div>
          </div>

          <div className="cachart">
            <h3>{t("revenueTrend")}</h3>
            {d.revenueTrend.length ? (
              <div className="cachart__bars">
                {d.revenueTrend.map((x, i) => (
                  <div className="cachart__bar" key={i}><span style={{ height: `${(x.value / trendMax) * 100}%` }} /><small>{x.label}</small></div>
                ))}
              </div>
            ) : <p className="advmuted">{t("noData")}</p>}
          </div>

          <div className="pgrid2">
            <div className="cablock">
              <h3>{t("funnel")}</h3>
              {d.funnel.length ? (
                <div className="fnl">
                  {d.funnel.map((x, i) => (
                    <div className="fnl__row" key={i}>
                      <span className="fnl__l">{x.label}</span>
                      <div className="fnl__bar"><span style={{ width: `${(x.value / funnelMax) * 100}%` }}>{x.value}</span></div>
                    </div>
                  ))}
                </div>
              ) : <p className="advmuted">{t("noData")}</p>}
            </div>
            <div className="cablock">
              <h3>{t("channels")}</h3>
              {d.channels.length ? (
                <div className="chan">
                  {d.channels.map((c, i) => (
                    <div className="chan__row" key={i}>
                      <span className="chan__n">{c.name}</span>
                      <div className="chan__bar"><span style={{ width: `${Math.min(c.pct, 100)}%` }} /></div>
                      <span className="chan__v">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="advmuted">{t("noData")}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
