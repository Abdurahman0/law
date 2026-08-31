"use client";

import { useTranslations } from "next-intl";
import { listOrders } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconBriefcase, IconMapPin, IconClock } from "@/components/icons";

export default function LawyerMarketplace() {
  const t = useTranslations("portal.lawyer.marketplace");
  const tc = useTranslations("portal.common");
  const res = useResource(listOrders, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: res.data.length })}</span>
      </div>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconBriefcase />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="pcards">
          {res.data.map((o) => (
            <div className="oppc oppc--full" key={o.id}>
              <div className="oppc__h">
                <span className="oppc__match">{o.status}</span>
                <span className="oppc__ago"><IconClock />{o.createdAt}</span>
              </div>
              <b>{o.title}</b>
              <small>
                <IconMapPin />
                {[o.region, o.budget].filter(Boolean).join(" · ")}
              </small>
              <div className="pcase__act">
                <button className="btn btn--pri btn--sm" type="button">{tc("accept")}</button>
                <button className="btn btn--line btn--sm" type="button">{tc("decline")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
