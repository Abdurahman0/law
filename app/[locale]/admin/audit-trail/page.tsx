"use client";

import { useTranslations } from "next-intl";
import { listAuditTrail } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconShieldCheck } from "@/components/icons";

function fmt(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("ru-RU");
}

export default function AdminAuditTrail() {
  const t = useTranslations("admin.audit");
  const res = useResource(() => listAuditTrail(), []);

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b><span className="advmuted">{res.data.length}</span></div>
      <p className="ppanel__note">{t("lead")}</p>
      {res.status === "loading" ? (
        <Skeleton rows={5} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconShieldCheck />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((a) => (
            <div className="creq" key={a.id}>
              <span className="creq__st" />
              <div className="creq__m">
                <b>{a.action || "—"}</b>
                <span>{[a.detail, a.ip, fmt(a.createdAt)].filter(Boolean).join(" · ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
