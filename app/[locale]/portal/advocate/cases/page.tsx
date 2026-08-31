"use client";

import { useTranslations } from "next-intl";
import { listCases } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconFileText, IconMapPin } from "@/components/icons";

export default function AdvocateCases() {
  const t = useTranslations("portal.advocate.cases");
  const res = useResource(listCases, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: res.data.length })}</span>
      </div>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconFileText />} title={t("emptyTitle")} text={t("emptyText")} />
      ) : (
        <div className="pcards">
          {res.data.map((c) => (
            <div className="pcase" key={c.id}>
              <div className="pcase__h">
                <span className="pcase__id">#{c.caseNumber || c.id}</span>
                <span className="advmuted">{c.status}</span>
              </div>
              <p>{c.caseType}</p>
              <small>
                <IconMapPin />
                {[c.stage, c.nextAction, c.deadlineAt].filter(Boolean).join(" · ")}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
