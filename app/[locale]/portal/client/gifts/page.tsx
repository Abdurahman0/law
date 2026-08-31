"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/portal/DataState";
import { IconGift } from "@/components/icons";

export default function ClientGifts() {
  const t = useTranslations("portal.client.gifts");
  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <EmptyState icon={<IconGift />} title={t("empty")} text={t("emptyText")} />
    </div>
  );
}
