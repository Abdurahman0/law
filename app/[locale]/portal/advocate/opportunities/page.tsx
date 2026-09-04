"use client";

import { useTranslations } from "next-intl";
import { listOrders } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import OrderActions from "@/components/portal/OrderActions";
import { IconClock, IconMapPin, IconBriefcase } from "@/components/icons";

export default function AdvocateOpportunities() {
  const t = useTranslations("portal.advocate.opportunities");
  const res = useResource(listOrders, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: res.data.length })}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("intro")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconBriefcase />} title={t("emptyTitle")} text={t("emptyText")} />
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
              <OrderActions orderId={o.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
