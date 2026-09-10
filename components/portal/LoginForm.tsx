"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import type { TwoFactorChallenge } from "@/lib/services/backend";
import { Link, useRouter } from "@/i18n/navigation";
import { formatUzSubscriber, uzSubscriber } from "@/lib/phone";
import { IconLogo } from "../icons";
import PasswordInput from "../PasswordInput";

export default function LoginForm() {
  const t = useTranslations("portal.login");
  const { login, completeLogin2fa, session, ready } = useAuth();
  const router = useRouter();

  // Already signed in → the login page is off-limits until logout.
  useEffect(() => {
    if (ready && session) router.replace(`/portal/${session.role}`);
  }, [ready, session, router]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 2FA challenge (set when the account has 2FA enabled).
  const [twoFa, setTwoFa] = useState<TwoFactorChallenge | null>(null);
  const [code, setCode] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const p = phone.trim();
    if (!p || !password) {
      setErr(t("required"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      // Real login resolves the role from the backend; the fallback role only
      // applies when the API is unreachable (offline demo).
      const s = await login(p, password, { role: "client", name: t("roleClient") });
      if ("twoFactor" in s) {
        // 2FA enabled → move to the code step (prefilled in demo mode).
        setTwoFa(s.twoFactor);
        setCode(s.twoFactor.demoOtp || "");
        setBusy(false);
        return;
      }
      router.replace(`/portal/${s.role}`);
    } catch {
      setErr(t("failed"));
      setBusy(false);
    }
  }

  async function submit2fa(e: FormEvent) {
    e.preventDefault();
    if (busy || !twoFa) return;
    if (code.trim().length < 4) {
      setErr(t("failed"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const s = await completeLogin2fa(twoFa.verificationId, code.trim(), phone);
      router.replace(`/portal/${s.role}`);
    } catch {
      setErr(t("failed"));
      setBusy(false);
    }
  }

  if (twoFa) {
    return (
      <div className="plogin">
        <form className="plogin__c" onSubmit={submit2fa}>
          <span className="logo" style={{ color: "var(--ink)", display: "inline-flex", gap: 9, alignItems: "center" }}>
            <span className="logo__m"><IconLogo /></span>
            LexGo
          </span>
          <h1 style={{ marginTop: 18 }}>{t("twoFaTitle")}</h1>
          <p className="sub">{t("twoFaSubtitle", { phone: twoFa.phone || phone })}</p>
          <div className="cform" style={{ maxWidth: "none", marginTop: 20 }}>
            <div>
              <label htmlFor="l-2fa">{t("twoFaCode")}</label>
              <input
                id="l-2fa"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("twoFaCodePh")}
                autoFocus
              />
            </div>
            {twoFa.demoOtp ? <p className="plogin__note">{t("demoHint", { code: twoFa.demoOtp })}</p> : null}
            {err ? <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>{err}</p> : null}
            <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
              {busy ? t("busy") : t("twoFaVerify")}
            </button>
            <button className="btn btn--ghost btn--full" type="button" onClick={() => { setTwoFa(null); setCode(""); setErr(null); }}>
              {t("twoFaBack")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="plogin">
      <form className="plogin__c" onSubmit={submit}>
        <span
          className="logo"
          style={{ color: "var(--ink)", display: "inline-flex", gap: 9, alignItems: "center" }}
        >
          <span className="logo__m">
            <IconLogo />
          </span>
          LexGo
        </span>
        <h1 style={{ marginTop: 18 }}>{t("title")}</h1>
        <p className="sub">{t("subtitle")}</p>

        <div className="cform" style={{ maxWidth: "none", marginTop: 20 }}>
          <div>
            <label htmlFor="l-phone">{t("phone")}</label>
            <div className="phonf">
              <span className="phonf__cc">+998</span>
              <input
                id="l-phone"
                type="tel"
                inputMode="tel"
                value={formatUzSubscriber(phone)}
                onChange={(e) => {
                  const d = uzSubscriber(e.target.value);
                  setPhone(d ? "+998" + d : "");
                }}
                placeholder="90 123 45 67"
                autoComplete="tel"
              />
            </div>
          </div>
          <div>
            <label htmlFor="l-pw">{t("password")}</label>
            <PasswordInput
              id="l-pw"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPh")}
              autoComplete="current-password"
            />
          </div>
          <div style={{ textAlign: "right", marginTop: -6 }}>
            <Link href="/reset-password" className="plogin__link">
              {t("forgot")}
            </Link>
          </div>
          {err ? (
            <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>{err}</p>
          ) : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("busy") : t("submit")}
          </button>
        </div>
        <p className="plogin__alt">
          {t("noAccount")}{" "}
          <Link href="/register" className="plogin__link">
            {t("createAccount")}
          </Link>
        </p>
        <p className="plogin__note">{t("note")}</p>
      </form>
    </div>
  );
}
