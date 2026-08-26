"use client";

import { useTranslations } from "next-intl";
import CalendarMonth from "@/components/portal/CalendarMonth";

export default function LawyerCalendar() {
  const t = useTranslations("portal.lawyer.calendar");
  return (
    <>
      <h2 className="psec-h">{t("title")}</h2>
      <CalendarMonth />
    </>
  );
}
