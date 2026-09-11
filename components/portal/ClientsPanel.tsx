"use client";

import { useTranslations } from "next-intl";
import { getLawyerClients } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { initials } from "@/lib/lawyers";
import { IconUsers, IconAlert } from "@/components/icons";

// Client roster + conflict-check, shared by the advocate and lawyer portals.
export default function ClientsPanel({ ns }: { ns: string }) {
  const t = useTranslations(ns);
  const res = useResource(getLawyerClients, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{res.data.length}</span>
      </div>

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconUsers />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="pclients">
          {res.data.map((c) => (
            <div className="pclient" key={c.id}>
              <span className="pclient__av">{initials(c.name || "?")}</span>
              <div className="pclient__m">
                <b>{c.name || "—"}</b>
                <span>
                  {[c.phone, t("casesCount", { n: c.casesCount }), t("ordersCount", { n: c.ordersCount })]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {c.hasConflict ? (
                  <em className="pclient__conflict">
                    <IconAlert />
                    {t("conflictAlert")}
                  </em>
                ) : null}
              </div>
              {c.activeCaseIds.length ? (
                <span className="pclient__badge pclient__badge--ok">{t("activeCases", { n: c.activeCaseIds.length })}</span>
              ) : null}
              {c.hasConflict ? <span className="pclient__badge pclient__badge--warn">{t("conflict")}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
