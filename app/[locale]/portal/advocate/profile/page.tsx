"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import ProfilePreview from "@/components/register/ProfilePreview";
import { EmptyState } from "@/components/portal/DataState";
import { IconInfo, IconUser } from "@/components/icons";

export default function AdvocateProfile() {
  const t = useTranslations("portal.advocate.profile");
  const { session } = useAuth();
  const profile = session?.profile;
  const completeness = session?.completeness ?? 0;

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
      </div>
      <ProfilePreview p={profile} />
    </div>
  );
}
