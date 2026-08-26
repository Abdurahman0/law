"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LAWYER_KPIS, MARKETPLACE } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";

export default function LawyerDashboard() {
  const t = useTranslations("portal.lawyer.dashboard");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const [cases, setCases] = useState(MARKETPLACE);

  const kpis = [
    { v: LAWYER_KPIS.urgent, k: "urgent" },
    { v: LAWYER_KPIS.courts, k: "courts" },
    { v: LAWYER_KPIS.deadlines, k: "deadlines" },
    { v: LAWYER_KPIS.messages, k: "messages" },
    { v: LAWYER_KPIS.toReview, k: "toReview" },
  ];
  const fin = [
    { v: LAWYER_KPIS.incomeToday, k: "incomeToday" },
    { v: LAWYER_KPIS.incomeMonth, k: "incomeMonth" },
    { v: LAWYER_KPIS.pending, k: "pending" },
    { v: LAWYER_KPIS.viaLexgo, k: "viaLexgo" },
  ];

  return (
    <>
      <div>
        <h2 className="psec-h" style={{ marginBottom: 12 }}>
          {t("today")}
        </h2>
        <div className="pk">
          {kpis.map((x) => (
            <div className="pk__i" key={x.k}>
              <b>{x.v}</b>
              <span>{t(x.k)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="psec-h" style={{ marginBottom: 12 }}>
          {t("finance")}
        </h2>
        <div className="pk">
          {fin.map((x) => (
            <div className="pk__i" key={x.k}>
              <b className="cy">{x.v}</b>
              <span>{t(x.k)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("newCases")}</b>
          <Link href="/portal/lawyer/marketplace">{tc("viewAll")}</Link>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--gray)", fontSize: ".88rem" }}>
          {t("newCasesSub", { n: cases.length })}
        </p>
        <div className="pcards">
          {cases.map((c) => (
            <div className="pcase" key={c.id}>
              <div className="pcase__h">
                <span className="pcase__id">CASE #{c.id}</span>
                <StatusPill kind="status" value={c.status} />
              </div>
              <p>{c.title}</p>
              <small>
                {te(`areas.${c.areaKey}`)} · {c.nextAction} · {c.value} {te("currency")}
              </small>
              <div className="pcase__act">
                <button
                  className="btn btn--pri btn--sm"
                  type="button"
                  onClick={() => setCases((cs) => cs.filter((x) => x.id !== c.id))}
                >
                  {tc("accept")}
                </button>
                <button
                  className="btn btn--line btn--sm"
                  type="button"
                  onClick={() => setCases((cs) => cs.filter((x) => x.id !== c.id))}
                >
                  {tc("decline")}
                </button>
                <button className="btn btn--soft btn--sm" type="button">
                  {tc("requestInfo")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
