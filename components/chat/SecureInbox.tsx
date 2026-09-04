"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { listSecureChats } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconShieldCheck, IconArrowRight } from "@/components/icons";

export default function SecureInbox() {
  const t = useTranslations("secureChat.inbox");
  const res = useResource(listSecureChats, []);

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
        <EmptyState icon={<IconShieldCheck />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((r) => (
            <Link key={r.id} href={`/portal/chat/${r.id}`} className="aitem aitem--link">
              <span className="aitem__n"><IconShieldCheck /></span>
              <div className="aitem__m">
                <b>{t("room")} · {r.id.slice(0, 8)}</b>
                {r.status ? <span className="aitem__meta">{r.status}</span> : null}
              </div>
              <span className="aitem__r"><IconArrowRight /></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
