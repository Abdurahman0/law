"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { listLawyers, adminVerifyLawyer, type BackendLawyer } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminItem, useReload } from "@/components/admin/AdminBits";
import { IconAward, IconCheck } from "@/components/icons";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function VerifyBtn({ userId, onDone }: { userId: string; onDone: () => void }) {
  const t = useTranslations("admin.verifications");
  const [busy, setBusy] = useState(false);
  async function go() {
    if (busy || !userId) return;
    setBusy(true);
    try {
      await adminVerifyLawyer(userId);
      onDone();
    } catch {
      setBusy(false);
    }
  }
  return (
    <button className="btn btn--pri btn--sm" type="button" onClick={go} disabled={busy}>
      <IconCheck />
      {busy ? t("verifying") : t("verify")}
    </button>
  );
}

export default function AdminVerifications() {
  const t = useTranslations("admin.verifications");
  const [key, reload] = useReload();
  const res = useResource(listLawyers, [key]);

  const pending = res.data.filter((l) => !l.verified);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("pendingCount", { n: pending.length })}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconAward />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((l: BackendLawyer, i) => (
            <AdminItem
              key={l.id || i}
              index={i + 1}
              title={l.name || "—"}
              meta={[cap(l.sellerType), l.region, l.experienceYears ? `${l.experienceYears} yil` : ""]
                .filter(Boolean)
                .join(" · ")}
              tags={
                l.verified
                  ? [{ label: t("verified"), tone: "ok" }]
                  : [{ label: t(l.verificationStatus === "pending" ? "pending" : "unverified"), tone: "muted" }]
              }
              right={l.verified ? undefined : <VerifyBtn userId={l.userId} onDone={reload} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
