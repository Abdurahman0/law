"use client";

import { useTranslations } from "next-intl";
import { listLegalAid } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconScale, IconPhone } from "@/components/icons";

const s = (v: unknown) => (v == null ? "" : String(v));
const fmtDate = (v: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("ru-RU");
};

export default function AdminLegalAid() {
  const t = useTranslations("admin.legalAid");
  const res = useResource(listLegalAid, []);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{res.data.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconScale />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="laist">
          {res.data.map((r, i) => {
            const name = s(r.payload.name) || t("anon");
            const phone = s(r.payload.phone);
            const details = s(r.payload.details) || r.title;
            return (
              <div className="laitem" key={r.id || i}>
                <div className="laitem__h">
                  <b>{name}</b>
                  <span className={`aitem__st aitem__st--${(r.status || "new").toLowerCase()}`}>
                    {r.status || t("new")}
                  </span>
                </div>
                {phone ? (
                  <a className="laitem__phone" href={`tel:${phone}`}>
                    <IconPhone />
                    {phone}
                  </a>
                ) : null}
                {details ? <p className="laitem__details">{details}</p> : null}
                <span className="laitem__date">{fmtDate(r.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
