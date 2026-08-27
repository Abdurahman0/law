"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { SAMPLE_ADVOCATE } from "@/lib/mock/advocate";
import ProfilePreview from "@/components/register/ProfilePreview";
import { IconInfo } from "@/components/icons";

export default function AdvocateProfile() {
  const t = useTranslations("portal.advocate.profile");
  const { session } = useAuth();
  const profile =
    session?.profile && session.profile.name ? session.profile : SAMPLE_ADVOCATE;
  const completeness = session?.completeness ?? 78;

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
