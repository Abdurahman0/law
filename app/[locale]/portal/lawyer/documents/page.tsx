"use client";

import { useTranslations } from "next-intl";
import { IconFileText, IconDownload, IconSparkle } from "@/components/icons";

const DOCS = [
  { name: "Ijara shartnomasi — LX-10218.pdf", meta: "PDF · 240 KB · v3" },
  { name: "Da'vo arizasi — LX-10188.pdf", meta: "PDF · 180 KB · v1" },
];

export default function LawyerDocuments() {
  const t = useTranslations("portal.lawyer.documents");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <button className="btn btn--pri btn--sm" type="button">
          {t("upload")}
        </button>
      </div>
      <p style={{ margin: "0 0 16px", color: "var(--gray)", fontSize: ".9rem" }}>
        {t("lead")}
      </p>
      <div>
        {DOCS.map((d) => (
          <div className="prow" key={d.name}>
            <span className="prow__i" style={{ background: "var(--grad)", color: "#fff" }}>
              <IconFileText />
            </span>
            <div className="prow__m">
              <b>{d.name}</b>
              <span>{d.meta}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <button className="btn btn--soft btn--sm" type="button">
                <IconSparkle style={{ width: 15, height: 15 }} />
                {t("aiAnalyze")}
              </button>
              <button className="btn btn--line btn--sm" type="button">
                <IconDownload style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="info" style={{ marginTop: 16 }}>
        <IconSparkle />
        <span>{t("aiNote")}</span>
      </div>
    </div>
  );
}
