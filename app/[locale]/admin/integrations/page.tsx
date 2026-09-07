"use client";

import { useTranslations } from "next-intl";
import { getIntegrationsStatus } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconBolt } from "@/components/icons";

export default function AdminIntegrations() {
  const t = useTranslations("admin.integrations");
  const res = useResource(() => getIntegrationsStatus(), []);

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b></div>
      <p className="ppanel__note">{t("lead")}</p>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconBolt />} title={t("empty")} text={t("empty")} />
      ) : (
        <div className="intg">
          {res.data.map((i) => (
            <div className={`intg__c${i.healthy ? " ok" : ""}`} key={i.key}>
              <span className="intg__dot" />
              <b>{t.has(`keys.${i.key}`) ? t(`keys.${i.key}`) : i.key}</b>
              <span className="intg__st">{t.has(`status.${i.status}`) ? t(`status.${i.status}`) : i.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
