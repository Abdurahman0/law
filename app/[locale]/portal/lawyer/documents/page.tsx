"use client";

import { useTranslations } from "next-intl";
import { getDocumentTemplates } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconFileText, IconDownload } from "@/components/icons";

export default function LawyerDocuments() {
  const t = useTranslations("portal.lawyer.documents");
  const res = useResource(getDocumentTemplates, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <p style={{ margin: "0 0 16px", color: "var(--gray)", fontSize: ".9rem" }}>
        {t("lead")}
      </p>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconFileText />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div>
          {res.data.map((d) => (
            <div className="prow" key={d.id}>
              <span className="prow__i" style={{ background: "var(--grad)", color: "#fff" }}>
                <IconFileText />
              </span>
              <div className="prow__m">
                <b>{d.name}</b>
                <span>{[d.category, d.language].filter(Boolean).join(" · ")}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flex: "none" }}>
                <button className="btn btn--line btn--sm" type="button">
                  <IconDownload style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
