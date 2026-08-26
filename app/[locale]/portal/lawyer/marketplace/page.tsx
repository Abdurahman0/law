"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MARKETPLACE } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";

export default function Marketplace() {
  const t = useTranslations("portal.lawyer.marketplace");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const [cases, setCases] = useState(MARKETPLACE);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <p style={{ margin: "0 0 16px", color: "var(--gray)", fontSize: ".9rem" }}>
        {t("lead")}
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
  );
}
