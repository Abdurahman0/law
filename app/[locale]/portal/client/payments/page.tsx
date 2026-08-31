"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/portal/DataState";
import { IconCard } from "@/components/icons";

export default function ClientPayments() {
  const t = useTranslations("portal.client.payments");
  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <EmptyState icon={<IconCard />} title={t("empty")} text={t("emptyText")} />
    </div>
  );
}
