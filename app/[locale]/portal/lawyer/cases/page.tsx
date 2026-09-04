"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getMyCases, type BackendCase } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import CaseManageModal from "@/components/portal/CaseManageModal";
import { IconFileText, IconMapPin } from "@/components/icons";

export default function LawyerCases() {
  const t = useTranslations("portal.lawyer.cases");
  const [reloadKey, setReloadKey] = useState(0);
  const res = useResource<BackendCase>(getMyCases, [reloadKey]);
  const [target, setTarget] = useState<BackendCase | null>(null);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: res.data.length })}</span>
      </div>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconFileText />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="pcards">
          {res.data.map((c) => (
            <button className="pcase pcase--btn" key={c.id} type="button" onClick={() => setTarget(c)}>
              <div className="pcase__h">
                <span className="pcase__id">#{c.caseNumber || c.id}</span>
                <span className="advmuted">{c.status}</span>
              </div>
              <p>{c.caseType}</p>
              <small>
                <IconMapPin />
                {[c.stage, c.nextAction, c.deadlineAt].filter(Boolean).join(" · ")}
              </small>
            </button>
          ))}
        </div>
      )}

      <CaseManageModal target={target} onClose={() => setTarget(null)} onSaved={() => setReloadKey((k) => k + 1)} />
    </div>
  );
}
