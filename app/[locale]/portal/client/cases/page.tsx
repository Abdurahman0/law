"use client";

import { useTranslations } from "next-intl";
import { listCases } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconFileText, IconArrowRight } from "@/components/icons";

export default function ClientCases() {
  const t = useTranslations("portal.client.cases");
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
        <EmptyState icon={<IconFileText />} title={t("empty")} text={t("emptyText")} />
      ) : (
        res.data.map((c) => (
          <div className="creq" key={c.id}>
            <span className="creq__st" />
            <div className="creq__m">
              <b>{c.caseType || c.caseNumber}</b>
              <span>{[c.stage, c.caseNumber].filter(Boolean).join(" · ")}</span>
              {c.nextAction ? (
                <em className="creq__next">
                  <IconArrowRight />
                  {c.nextAction}
                </em>
              ) : null}
            </div>
            <div className="creq__side">
              <span className="creq__badge">{c.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
