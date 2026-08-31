"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "./DataState";
import { IconRocket } from "@/components/icons";

export default function PromotionPanel() {
  const t = useTranslations("promotion");
  return (
    <div className="promo">
      <div className="promo__hero">
        <div className="promo__hero-t">
          <span className="kick" style={{ color: "var(--b300)", background: "rgba(92,168,255,.16)" }}>
            <IconRocket />
            {t("kicker")}
          </span>
          <h2 className="h2" style={{ color: "#fff" }}>{t("title")}</h2>
          <p className="lead" style={{ color: "#B7CDEC" }}>{t("intro")}</p>
        </div>
      </div>
      <div className="ppanel" style={{ marginTop: 18 }}>
        <EmptyState icon={<IconRocket />} title={t("empty")} text={t("emptyText")} />
      </div>
    </div>
  );
}
