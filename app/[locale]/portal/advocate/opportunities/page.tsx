"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OPPORTUNITIES } from "@/lib/mock/advocate";
import { IconClock, IconMapPin, IconBriefcase } from "@/components/icons";

export default function AdvocateOpportunities() {
  const t = useTranslations("portal.advocate.opportunities");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const [list, setList] = useState(OPPORTUNITIES);

  function drop(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: list.length })}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("intro")}</p>

      {list.length ? (
        <div className="pcards">
          {list.map((o) => (
            <div className="oppc oppc--full" key={o.id}>
              <div className="oppc__h">
                <span className="oppc__match">{o.matchPct}% {t("match")}</span>
                <span className="oppc__ago"><IconClock />{o.postedAgoMin}m</span>
              </div>
              <b>{o.title}</b>
              <small>
                <IconMapPin />{te(`regions.${o.region}`)} · {te(`areas.${o.areaKey}`)} · {o.budget} {te("currency")}
              </small>
              <div className="pcase__act">
                <button className="btn btn--pri btn--sm" type="button" onClick={() => drop(o.id)}>{tc("accept")}</button>
                <button className="btn btn--line btn--sm" type="button" onClick={() => drop(o.id)}>{tc("decline")}</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pempty">
          <IconBriefcase />
          <b>{t("emptyTitle")}</b>
          <p>{t("emptyText")}</p>
        </div>
      )}
    </div>
  );
}
