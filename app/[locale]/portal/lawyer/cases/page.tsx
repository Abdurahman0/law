"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LAWYER_CASES, type CaseStatus, type LawyerCase } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";
import FDate from "@/components/FDate";
import { IconClose } from "@/components/icons";

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
  const tcd = useTranslations("portal.lawyer.caseDetail");
  const [f, setF] = useState<CaseStatus | "all">("all");
  const [sel, setSel] = useState<LawyerCase | null>(null);
  const cur = te("currency");
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
              <tr
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSel(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSel(c);
                }}
              >
                <td>
                  <b>#{c.id}</b>
                  <div style={{ color: "var(--gray2)", fontSize: ".8rem" }}>
                    {te(`areas.${c.areaKey}`)}
                  </div>
                </td>
                <td>{c.client}</td>
                <td>{te(`stages.${c.stageKey}.name`)}</td>
                <td>
                  <FDate v={c.deadline} />
                </td>
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

      {sel ? (
        <div className="pmodal" onClick={() => setSel(null)}>
          <div className="pmodal__c" onClick={(e) => e.stopPropagation()}>
            <div className="pmodal__h">
              <div>
                <b>#{sel.id}</b>
                <div style={{ color: "var(--gray2)", fontSize: ".82rem" }}>
                  {tcd("overview")}
                </div>
              </div>
              <button
                className="pmodal__x"
                type="button"
                onClick={() => setSel(null)}
                aria-label={tc("close")}
              >
                <IconClose />
              </button>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: ".95rem", lineHeight: 1.5 }}>
              {sel.title}
            </p>
            <div className="pkv">
              <div className="pkv__i">
                <label>{tc("cols.client")}</label>
                <b>{sel.client}</b>
              </div>
              <div className="pkv__i">
                <label>{tcd("caseType")}</label>
                <b>{te(`areas.${sel.areaKey}`)}</b>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.stage")}</label>
                <b>{te(`stages.${sel.stageKey}.name`)}</b>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.deadline")}</label>
                <b>
                  <FDate v={sel.deadline} />
                </b>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.nextAction")}</label>
                <b>{sel.nextAction}</b>
              </div>
              <div className="pkv__i">
                <label>{tcd("value")}</label>
                <b>
                  {sel.value} {cur}
                </b>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.status")}</label>
                <div>
                  <StatusPill kind="status" value={sel.status} />
                </div>
              </div>
              <div className="pkv__i">
                <label>{tcd("paymentStatus")}</label>
                <div>
                  <StatusPill kind="payment" value={sel.payment} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
