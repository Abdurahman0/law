"use client";

import { useTranslations } from "next-intl";
import { listLeads } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminItem } from "@/components/admin/AdminBits";
import { IconUsers } from "@/components/icons";

export default function AdminLeads() {
  const t = useTranslations("admin");
  const res = useResource(listLeads, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("leads.title")}</b>
        <span className="advmuted">{res.data.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("leads.lead")}</p>
      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconUsers />} title={t("leads.empty")} text={t("leads.emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((l, i) => (
            <AdminItem
              key={l.id}
              index={i + 1}
              title={l.name || l.phone || l.category || l.source}
              meta={[l.phone, l.category, l.region, l.note].filter(Boolean).join(" · ")}
              right={l.source}
              tags={[
                ...(l.urgency ? [{ label: l.urgency }] : []),
                ...(l.status ? [{ label: l.status, tone: "ok" as const }] : []),
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
