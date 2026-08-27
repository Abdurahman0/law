"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { sendCode } from "@/lib/services/sms";
import { IconPhone, IconSend } from "../icons";

export default function PhoneStep({
  phone,
  onChange,
  onSent,
}: {
  phone: string;
  onChange: (v: string) => void;
  onSent: () => void;
}) {
  const t = useTranslations("register.phone");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setErr(null);
    setBusy(true);
    const res = await sendCode(phone);
    if (res.ok) {
      setBusy(false);
      onSent();
    } else {
      setBusy(false);
      setErr(t("invalid"));
    }
  }

  return (
    <div className="rf__step">
      <span className="rf__ico rf__ico--brand">
        <IconPhone />
      </span>
      <h1 className="rf__title">{t("title")}</h1>
      <p className="rf__sub">{t("subtitle")}</p>

      <div className="cform" style={{ maxWidth: "none", marginTop: 22 }}>
        <div>
          <label htmlFor="rf-phone">{t("label")}</label>
          <input
            id="rf-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={t("placeholder")}
            autoComplete="tel"
          />
        </div>
        {err ? <p className="rf__err">{err}</p> : null}
        <button
          className="btn btn--grad btn--full btn--lg"
          type="button"
          onClick={submit}
          disabled={busy}
        >
          {busy ? (
            <>
              <span className="spin" />
              {t("sending")}
            </>
          ) : (
            <>
              <IconSend />
              {t("send")}
            </>
          )}
        </button>
      </div>

      <p className="rf__terms">{t("terms")}</p>
      <p className="rf__alt">
        {t("haveAccount")}{" "}
        <Link href="/login" className="rf__link">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
