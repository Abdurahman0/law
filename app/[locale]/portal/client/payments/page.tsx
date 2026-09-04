"use client";

import { useTranslations } from "next-intl";
import { listOrders } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconCard } from "@/components/icons";

const som = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("ru-RU").replace(/,/g, " ") : v || "—";
};
const fmtDate = (s: string) => {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
};

export default function ClientPayments() {
  const t = useTranslations("portal.client.payments");
  const res = useResource(listOrders, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("history")}</span>
      </div>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconCard />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="ptable__wrap">
          <div className="ptable">
            <div className="ptable__head">
              <span>{t("what")}</span>
              <span>{t("date")}</span>
              <span>{t("amount")}</span>
              <span>{t("id")}</span>
            </div>
            {res.data.map((o) => (
              <div className="ptable__row" key={o.id}>
                <span data-l={t("what")}>
                  <b>{o.title || o.serviceName || "—"}</b>
                </span>
                <span data-l={t("date")}>{fmtDate(o.createdAt)}</span>
                <span data-l={t("amount")}>{som(o.budget)}</span>
                <span data-l={t("id")}>
                  <span className="creq__badge">{o.paymentStatus || o.status || "—"}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
