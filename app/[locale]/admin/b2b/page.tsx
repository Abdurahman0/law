"use client";

import { useTranslations } from "next-intl";
import { listB2bClients } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconBuilding } from "@/components/icons";

const som = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function AdminB2b() {
  const t = useTranslations("admin.b2b");
  const res = useResource(() => listB2bClients(), []);

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b><span className="advmuted">{res.data.length}</span></div>
      <p className="ppanel__note">{t("lead")}</p>
      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconBuilding />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((c) => (
            <div className="aitem" key={c.id}>
              <span className="aitem__n"><IconBuilding /></span>
              <div className="aitem__m">
                <b>{c.name || "—"}</b>
                <span className="aitem__meta">{[c.industry, c.contact].filter(Boolean).join(" · ")}</span>
              </div>
              <div className="aitem__r" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {c.value ? <b className="b2b__val">{som(c.value)}</b> : null}
                <span className="creq__badge">{t.has(`stage.${c.stage}`) ? t(`stage.${c.stage}`) : c.stage}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
