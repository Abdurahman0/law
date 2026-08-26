"use client";

import { useTranslations } from "next-intl";
import { CALENDAR } from "@/lib/portalData";
import { IconCalendar, IconClock, IconUsers, IconAlert } from "@/components/icons";
import FDate from "@/components/FDate";

const ICON = {
  hearing: IconCalendar,
  investigative: IconClock,
  meeting: IconUsers,
  deadline: IconAlert,
};

export default function LawyerCalendar() {
  const t = useTranslations("portal.lawyer.calendar");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <div>
        {CALENDAR.map((e, i) => {
          const I = ICON[e.typeKey];
          return (
            <div className="prow" key={i}>
              <span className="prow__i">
                <I />
              </span>
              <div className="prow__m">
                <b>{e.title}</b>
                <span>
                  {t(e.typeKey)} · #{e.caseId}
                </span>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <b style={{ display: "block", fontSize: ".9rem" }}>
                  <FDate v={e.date} />
                </b>
                <span style={{ fontSize: ".8rem", color: "var(--gray2)" }}>
                  {e.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
