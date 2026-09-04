"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { requestVerification, getLawyerServices } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import ProfilePreview from "@/components/register/ProfilePreview";
import { EmptyState, Skeleton } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import { IconInfo, IconUser, IconShieldCheck, IconBriefcase } from "@/components/icons";

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
      <MyServices userId={session?.id ?? ""} />
      <ProfilePreview p={profile} />
    </div>
  );
}

function MyServices({ userId }: { userId: string }) {
  const t = useTranslations("portal.advocate.profile");
  const load = useCallback(() => (userId ? getLawyerServices(userId) : Promise.resolve([])), [userId]);
  const svc = useResource(load, [userId]);
  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("servicesTitle")}</b>
        <span className="advmuted">{svc.data.length}</span>
      </div>
      {svc.status === "loading" ? (
        <Skeleton rows={2} />
      ) : !svc.data.length ? (
        <EmptyState icon={<IconBriefcase />} title={t("servicesEmpty")} text={t("servicesEmptyText")} />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {svc.data.map((s) => (
            <span className="chip" key={s.id}>{s.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
