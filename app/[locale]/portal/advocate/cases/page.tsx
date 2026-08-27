"use client";

import { useTranslations } from "next-intl";
import { LAWYER_CASES } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";
import FDate from "@/components/FDate";
import { IconMapPin } from "@/components/icons";

export default function AdvocateCases() {
  const t = useTranslations("portal.advocate.cases");
  const te = useTranslations("enums");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: LAWYER_CASES.length })}</span>
      </div>
      <div className="pcards">
        {LAWYER_CASES.map((c) => (
          <div className="pcase" key={c.id}>
            <div className="pcase__h">
              <span className="pcase__id">#{c.id}</span>
              <StatusPill kind="status" value={c.status} />
            </div>
            <p>{c.title}</p>
            <small>
              <IconMapPin />
              {c.client} · {te(`areas.${c.areaKey}`)} · <FDate v={c.deadline} />
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
