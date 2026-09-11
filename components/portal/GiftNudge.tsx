"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconGift, IconArrowRight, IconClose } from "../icons";

// Module 10: every client account nudges gifting a package to someone close.
// Dismissible for the tab session.
export default function GiftNudge() {
  const t = useTranslations("portal.common.giftNudge");
  // Rendered only client-side (inside the portal shell, after auth is ready).
  const [hidden, setHidden] = useState(
    () => typeof window === "undefined" || sessionStorage.getItem("lexgo_giftnudge_dismissed") === "1",
  );
  if (hidden) return null;
  return (
    <div className="giftn" role="note">
      <span className="giftn__ic"><IconGift /></span>
      <div className="giftn__b">
        <b>{t("title")}</b>
        <p>{t("text")}</p>
      </div>
      <Link href="/portal/client/gifts" className="btn btn--grad btn--sm giftn__cta">
        {t("cta")}
        <IconArrowRight />
      </Link>
      <button
        type="button"
        className="giftn__x"
        aria-label={t("dismiss")}
        onClick={() => {
          sessionStorage.setItem("lexgo_giftnudge_dismissed", "1");
          setHidden(true);
        }}
      >
        <IconClose />
      </button>
    </div>
  );
}
