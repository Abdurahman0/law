"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LAWYER_CASES, type CaseStatus } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";
import FDate from "@/components/FDate";

const FILTERS: (CaseStatus | "all")[] = [
  "all",
  "active",
  "new",
  "investigation",
  "court",
  "appeal",
  "completed",
  "archived",
];

export default function LawyerCases() {
  const t = useTranslations("portal.lawyer.cases");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const [f, setF] = useState<CaseStatus | "all">("all");
  const rows = useMemo(
    () => LAWYER_CASES.filter((c) => f === "all" || c.status === f),
    [f],
  );

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <div className="chiprow" style={{ marginInline: 0, paddingInline: 0 }}>
        {FILTERS.map((s) => (
          <button
            key={s}
            className="fchip"
            aria-pressed={f === s}
            onClick={() => setF(s)}
          >
            {s === "all" ? t("filterAll") : tc(`status.${s}`)}
          </button>
        ))}
      </div>
      <div className="ptable__wrap" style={{ marginTop: 14 }}>
        <table className="ptable">
          <thead>
            <tr>
              <th>{tc("cols.case")}</th>
              <th>{tc("cols.client")}</th>
              <th>{tc("cols.stage")}</th>
              <th>{tc("cols.deadline")}</th>
              <th>{tc("cols.nextAction")}</th>
              <th>{tc("cols.status")}</th>
              <th>{tc("cols.payment")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>#{c.id}</b>
                  <div style={{ color: "var(--gray2)", fontSize: ".8rem" }}>
                    {te(`areas.${c.areaKey}`)}
                  </div>
                </td>
                <td>{c.client}</td>
                <td>{te(`stages.${c.stageKey}.name`)}</td>
                <td><FDate v={c.deadline} /></td>
                <td>{c.nextAction}</td>
                <td>
                  <StatusPill kind="status" value={c.status} />
                </td>
                <td>
                  <StatusPill kind="payment" value={c.payment} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
