"use client";

import { useTranslations } from "next-intl";
import { CLIENTS } from "@/lib/portalData";
import { initials } from "@/lib/lawyers";
import { IconInfo } from "@/components/icons";

export default function LawyerClients() {
  const t = useTranslations("portal.lawyer.clients");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <div>
        {CLIENTS.map((c) => (
          <div key={c.name}>
            <div className="prow">
              <span className="prow__i" style={{ background: "var(--grad)", color: "#fff" }}>
                {initials(c.name)}
              </span>
              <div className="prow__m">
                <b>{c.name}</b>
                <span>
                  {c.phone} · {c.email}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flex: "none" }}>
                <span className="pill pill--gray">{t("casesCount", { n: c.cases })}</span>
                {c.conflict ? <span className="st st--unpaid">{t("conflict")}</span> : null}
              </div>
            </div>
            {c.conflict ? (
              <div
                className="info"
                style={{ marginTop: 8, background: "#FDECEC", color: "#C0392B" }}
              >
                <IconInfo />
                <span>{t("conflictAlert")}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
