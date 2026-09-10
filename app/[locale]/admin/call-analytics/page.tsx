"use client";

import { useTranslations } from "next-intl";
import { getCallAnalytics } from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "@/components/portal/DataState";
import LineChart from "@/components/admin/LineChart";
import { IconPhone, IconCheck, IconClose, IconClock } from "@/components/icons";

const EMPTY = { total: 0, answered: 0, missed: 0, avgDurationSec: 0, byDay: [], topAgents: [] };
function mmss(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

export default function AdminCallAnalytics() {
  const t = useTranslations("admin.callAnalytics");
  const res = useResourceOne(getCallAnalytics, []);
  const a = res.data ?? EMPTY;
  const answerRate = a.total ? Math.round((a.answered / a.total) * 100) : 0;

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b></div>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : (
        <>
          <div className="castat">
            <div className="castat__c"><span className="castat__i"><IconPhone /></span><b>{a.total}</b><span>{t("total")}</span></div>
            <div className="castat__c"><span className="castat__i castat__i--ok"><IconCheck /></span><b>{a.answered}</b><span>{t("answered")} · {answerRate}%</span></div>
            <div className="castat__c"><span className="castat__i castat__i--bad"><IconClose /></span><b>{a.missed}</b><span>{t("missed")}</span></div>
            <div className="castat__c"><span className="castat__i"><IconClock /></span><b>{mmss(a.avgDurationSec)}</b><span>{t("avg")}</span></div>
          </div>

          <div className="cachart">
            <h3>{t("byDay")}</h3>
            {a.byDay.length ? (
              <LineChart points={a.byDay} />
            ) : (
              <p className="advmuted">{t("noData")}</p>
            )}
          </div>

          <div className="cablock">
            <h3>{t("topAgents")}</h3>
            {a.topAgents.length ? (
              <div className="alist">
                {a.topAgents.map((ag, i) => (
                  <div className="aitem" key={i}>
                    <span className="aitem__n">{i + 1}</span>
                    <div className="aitem__m"><b>{ag.name}</b></div>
                    <span className="creq__badge">{ag.calls}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="advmuted">{t("noData")}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
