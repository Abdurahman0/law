"use client";

import { useTranslations } from "next-intl";
import { getIntegrationsStatus, type Integration } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { humanizeSlug } from "@/lib/lawyers";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconBolt, IconLock } from "@/components/icons";

export default function AdminIntegrations() {
  const t = useTranslations("admin.integrations");
  const res = useResource(() => getIntegrationsStatus(), []);

  // Group by backend category, keeping the order the backend returns them in.
  const groups: { category: string; items: Integration[] }[] = [];
  for (const i of res.data) {
    const g = groups.find((x) => x.category === i.category);
    if (g) g.items.push(i);
    else groups.push({ category: i.category, items: [i] });
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b></div>
      <p className="ppanel__note">{t("lead")}</p>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconBolt />} title={t("empty")} text={t("empty")} />
      ) : (
        groups.map((g) => (
          <div className="intg__group" key={g.category || "_"}>
            {g.category ? (
              <b className="intg__cat">{t.has(`categories.${g.category}`) ? t(`categories.${g.category}`) : humanizeSlug(g.category)}</b>
            ) : null}
            <div className="intg">
              {g.items.map((i) => {
                const tone = i.status === "connected" || i.healthy ? "ok" : i.status === "degraded" ? "warn" : "off";
                return (
                  <div className={`intg__c intg__c--${tone}`} key={i.key}>
                    <span className="intg__dot" />
                    <b>{t.has(`keys.${i.key}`) ? t(`keys.${i.key}`) : i.label || i.key}</b>
                    {i.requiresSuperadmin ? (
                      <span className="intg__lock" title={t("superadminOnly")} aria-label={t("superadminOnly")}>
                        <IconLock />
                      </span>
                    ) : null}
                    <span className="intg__st">{t.has(`status.${i.status}`) ? t(`status.${i.status}`) : i.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
