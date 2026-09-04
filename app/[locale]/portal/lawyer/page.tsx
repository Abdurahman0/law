"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { listOrders } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import StatGrid from "@/components/portal/StatGrid";
import OrderActions from "@/components/portal/OrderActions";
import { IconBriefcase, IconClock, IconMapPin } from "@/components/icons";

export default function LawyerDashboard() {
  const t = useTranslations("portal.lawyer.dashboard");
  const tc = useTranslations("portal.common");
  const res = useResource(listOrders, []);

  return (
    <>
      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("today")}</b>
        </div>
        <StatGrid variant="workload" emptyTitle={t("kpisEmpty")} emptyText={t("kpisEmptyText")} />
      </div>

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("newCases")}</b>
          <Link href="/portal/lawyer/marketplace">{tc("viewAll")}</Link>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--gray)", fontSize: ".88rem" }}>
          {t("newCasesSub", { n: res.data.length })}
        </p>
        {res.status === "loading" ? (
          <Skeleton rows={3} />
        ) : !res.data.length ? (
          <EmptyState icon={<IconBriefcase />} title={t("newCasesEmpty")} text={t("newCasesEmptyText")} />
        ) : (
          <div className="pcards">
            {res.data.map((o) => (
              <div className="pcase" key={o.id}>
                <div className="pcase__h">
                  <span className="pcase__id">#{o.id}</span>
                  <span className="advmuted">{o.status}</span>
                </div>
                <p>{o.title}</p>
                <small>
                  <IconMapPin />
                  {[o.region, o.budget].filter(Boolean).join(" · ")}
                  {o.createdAt ? (
                    <>
                      {" "}
                      · <IconClock style={{ width: 13, height: 13 }} /> {o.createdAt}
                    </>
                  ) : null}
                </small>
                <OrderActions orderId={o.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
