"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";

export default function ClientProfile() {
  const t = useTranslations("portal.client.profile");
  const { session } = useAuth();

  return (
    <>
      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("personal")}</b>
        </div>
        <div className="pkv">
          <div className="pkv__i">
            <label>{t("name")}</label>
            <b>{session?.name ?? "—"}</b>
          </div>
          <div className="pkv__i">
            <label>{t("phone")}</label>
            <b>{session?.phone || "—"}</b>
          </div>
          <div className="pkv__i">
            <label>{t("email")}</label>
            <b>—</b>
          </div>
          <div className="pkv__i">
            <label>{t("card")}</label>
            <b>—</b>
          </div>
        </div>
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("family")}</b>
            <button className="btn btn--soft btn--sm" type="button">
              {t("addFamily")}
            </button>
          </div>
          <p style={{ margin: 0, color: "var(--gray2)", fontSize: ".88rem" }}>
            {t("noFamily")}
          </p>
        </div>
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("subscription")}</b>
          </div>
          <p style={{ margin: 0, color: "var(--gray)", fontSize: ".9rem" }}>
            Standard · active
          </p>
        </div>
      </div>
    </>
  );
}
