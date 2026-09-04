"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { requestVerification } from "@/lib/services/backend";
import ProfilePreview from "@/components/register/ProfilePreview";
import { EmptyState } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import { IconInfo, IconUser, IconShieldCheck } from "@/components/icons";

export default function AdvocateProfile() {
  const t = useTranslations("portal.advocate.profile");
  const { session } = useAuth();
  const profile = session?.profile;
  const completeness = session?.completeness ?? 0;
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function verify() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      await requestVerification();
      setNote({ ok: true, msg: t("verifyRequested") });
    } catch {
      setNote({ ok: false, msg: t("verifyError") });
    } finally {
      setBusy(false);
    }
  }

  if (!profile || !profile.name) {
    return <EmptyState icon={<IconUser />} title={t("emptyTitle")} text={t("emptyText")} />;
  }

  return (
    <div className="advprofile">
      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("title")}</b>
          <span className="advmuted">{t("visibility", { pct: completeness })}</span>
        </div>
        <div className="meter" style={{ marginBottom: 6 }}>
          <span style={{ width: `${completeness}%` }} />
        </div>
        <p className="advmuted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <IconInfo style={{ width: 16, height: 16, flex: "none" }} />
          {t("previewNote")}
        </p>
        <div className="pverify">
          <div>
            <b>{t("verifyTitle")}</b>
            <span>{t("verifyLead")}</span>
          </div>
          <button className="btn btn--pri btn--sm" type="button" onClick={verify} disabled={busy}>
            <IconShieldCheck />
            {busy ? t("verifySending") : t("verifyCta")}
          </button>
        </div>
        {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
      </div>
      <ProfilePreview p={profile} />
    </div>
  );
}
