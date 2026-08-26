"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconSparkle, IconArrowRight } from "@/components/icons";

export default function LawyerAi() {
  const t = useTranslations("portal.lawyer.ai");
  const actions = t.raw("actions") as string[];

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <p style={{ margin: "0 0 18px", color: "var(--gray)", fontSize: ".9rem" }}>
        {t("lead")}
      </p>
      <div className="grid">
        {actions.map((a) => (
          <button
            key={a}
            className="card"
            type="button"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="card__i">
              <IconSparkle />
            </span>
            <h3 className="h4">{a}</h3>
          </button>
        ))}
      </div>
      <Link href="/chat" className="btn btn--grad" style={{ marginTop: 18 }}>
        <IconArrowRight />
        LexGo.AI
      </Link>
    </div>
  );
}
