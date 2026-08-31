"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/portal/DataState";
import { IconUsers } from "@/components/icons";

export default function LawyerClients() {
  const t = useTranslations("portal.lawyer.clients");
  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <EmptyState icon={<IconUsers />} title={t("empty")} text={t("emptyText")} />
    </div>
  );
}
