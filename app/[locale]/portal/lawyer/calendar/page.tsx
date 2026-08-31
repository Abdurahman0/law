"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/portal/DataState";
import { IconCalendar } from "@/components/icons";

export default function LawyerCalendar() {
  const t = useTranslations("portal.lawyer.calendar");
  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <EmptyState icon={<IconCalendar />} title={t("empty")} text={t("emptyText")} />
    </div>
  );
}
