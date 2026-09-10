"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { forgotPassword, resetPassword } from "@/lib/services/backend";
import { isRateLimited } from "@/lib/http";
import { Link, useRouter } from "@/i18n/navigation";
import { formatUzSubscriber, uzSubscriber, normUzPhone } from "@/lib/phone";
import { IconLogo, IconCheck } from "../icons";
import PasswordInput from "../PasswordInput";

type Stage = "phone" | "code" | "done";

export default function ResetPasswordForm() {
  const t = useTranslations("portal.login");
  const tc = useTranslations("common");
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!phone.trim()) {
      setErr(t("resetPhoneRequired"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const r = await forgotPassword(normUzPhone(phone));
      setVerificationId(r.verificationId);
      setDemoOtp(r.demoOtp);
      setCode(r.demoOtp || "");
      setStage("code");
    } catch (e) {
      setErr(isRateLimited(e) ? tc("rateLimited") : t("resetError"));
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      setErr(t("resetWeak"));
      return;
    }
    if (code.trim().length < 4) {
      setErr(t("resetError"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await resetPassword(verificationId, code.trim(), password);
      setStage("done");
    } catch (e) {
      setErr(isRateLimited(e) ? tc("rateLimited") : t("resetError"));
    } finally {
      setBusy(false);
    }
  }

  const logo = (
    <span className="logo" style={{ color: "var(--ink)", display: "inline-flex", gap: 9, alignItems: "center" }}>
      <span className="logo__m"><IconLogo /></span>
      LexGo
    </span>
  );

  if (stage === "done") {
    return (
      <div className="plogin">
        <div className="plogin__c" style={{ textAlign: "center" }}>
          <span className="rf__ico rf__ico--brand" style={{ margin: "0 auto" }}><IconCheck /></span>
          <h1 style={{ marginTop: 14 }}>{t("resetDone")}</h1>
          <p className="sub">{t("resetDoneText")}</p>
          <button className="btn btn--pri btn--full" type="button" style={{ marginTop: 18 }} onClick={() => router.replace("/login")}>
            {t("resetBackToLogin")}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "code") {
    return (
      <div className="plogin">
        <form className="plogin__c" onSubmit={submitReset}>
          {logo}
          <h1 style={{ marginTop: 18 }}>{t("resetCodeTitle")}</h1>
          <p className="sub">{t("resetCodeSubtitle", { phone: phone })}</p>
          <div className="cform" style={{ maxWidth: "none", marginTop: 20 }}>
            <div>
              <label htmlFor="r-code">{t("resetCode")}</label>
              <input
                id="r-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("resetCodePh")}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="r-pw">{t("resetNewPassword")}</label>
              <PasswordInput
                id="r-pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("resetNewPasswordPh")}
                autoComplete="new-password"
              />
              <p className="rf__hint">{t("resetPasswordHint")}</p>
            </div>
            {demoOtp ? <p className="plogin__note">{t("demoHint", { code: demoOtp })}</p> : null}
            {err ? <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>{err}</p> : null}
            <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
              {busy ? t("resetSaving") : t("resetSubmit")}
            </button>
          </div>
          <p className="plogin__alt">
            <Link href="/login" className="plogin__link">{t("resetBackToLogin")}</Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="plogin">
      <form className="plogin__c" onSubmit={sendCode}>
        {logo}
        <h1 style={{ marginTop: 18 }}>{t("resetTitle")}</h1>
        <p className="sub">{t("resetSubtitle")}</p>
        <div className="cform" style={{ maxWidth: "none", marginTop: 20 }}>
          <div>
            <label htmlFor="r-phone">{t("resetPhone")}</label>
            <div className="phonf">
              <span className="phonf__cc">+998</span>
              <input
                id="r-phone"
                type="tel"
                inputMode="tel"
                value={formatUzSubscriber(phone)}
                onChange={(e) => {
                  const d = uzSubscriber(e.target.value);
                  setPhone(d ? "+998" + d : "");
                }}
                placeholder="90 123 45 67"
                autoComplete="tel"
                autoFocus
              />
            </div>
          </div>
          {err ? <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>{err}</p> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("resetSending") : t("resetSendCode")}
          </button>
        </div>
        <p className="plogin__alt">
          <Link href="/login" className="plogin__link">{t("resetBackToLogin")}</Link>
        </p>
      </form>
    </div>
  );
}
