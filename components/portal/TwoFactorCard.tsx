"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { start2fa, verify2fa, disable2fa, setupTotp, enableTotp, type TotpSetup } from "@/lib/services/backend";
import { isRateLimited } from "@/lib/http";
import { Notice } from "@/components/admin/AdminBits";
import { IconShield, IconShieldCheck, IconChevronLeft } from "@/components/icons";

// Two-factor management: SMS OTP or an authenticator app (TOTP). Status comes
// from the session's two_factor_enabled/method (backend now returns it), with a
// local flag as an offline fallback.
export default function TwoFactorCard() {
  const t = useTranslations("portal.common.twofa");
  const tc = useTranslations("common");
  const { session, update } = useAuth();
  const storeKey = `lexgo_2fa_${session?.id || "anon"}`;
  // Prefer the real backend flag; fall back to the local one offline.
  const on =
    session?.twoFactorEnabled !== undefined
      ? !!session.twoFactorEnabled
      : typeof window !== "undefined" && localStorage.getItem(storeKey) === "1";
  const [stage, setStage] = useState<"idle" | "sms" | "totp">("idle");
  const [vid, setVid] = useState("");
  const [demo, setDemo] = useState("");
  const [totp, setTotp] = useState<TotpSetup | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  function reset() {
    setStage("idle");
    setCode("");
    setDemo("");
    setTotp(null);
    setNote(null);
  }

  async function enableSms() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await start2fa();
      setVid(r.verificationId);
      setDemo(r.demoOtp);
      setCode(r.demoOtp || "");
      setStage("sms");
    } catch (e) {
      setNote({ ok: false, msg: isRateLimited(e) ? tc("rateLimited") : t("errStart") });
    } finally {
      setBusy(false);
    }
  }
  async function startTotp() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      setTotp(await setupTotp());
      setCode("");
      setStage("totp");
    } catch (e) {
      setNote({ ok: false, msg: isRateLimited(e) ? tc("rateLimited") : t("errStart") });
    } finally {
      setBusy(false);
    }
  }
  async function finishEnable(method: "sms" | "totp") {
    localStorage.setItem(storeKey, "1");
    update({ twoFactorEnabled: true, twoFactorMethod: method });
    reset();
    setNote({ ok: true, msg: t("enabled") });
  }
  async function verifySms() {
    if (busy || code.trim().length < 4) return;
    setBusy(true);
    setNote(null);
    try {
      await verify2fa(vid, code.trim());
      await finishEnable("sms");
    } catch (e) {
      setNote({ ok: false, msg: isRateLimited(e) ? tc("rateLimited") : t("errVerify") });
    } finally {
      setBusy(false);
    }
  }
  async function verifyTotp() {
    if (busy || !totp || code.trim().length < 6) return;
    setBusy(true);
    setNote(null);
    try {
      await enableTotp(totp.setupId, code.trim());
      await finishEnable("totp");
    } catch (e) {
      setNote({ ok: false, msg: isRateLimited(e) ? tc("rateLimited") : t("errVerify") });
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      await disable2fa();
      localStorage.removeItem(storeKey);
      update({ twoFactorEnabled: false, twoFactorMethod: "" });
      reset();
      setNote({ ok: true, msg: t("disabledMsg") });
    } catch (e) {
      setNote({ ok: false, msg: isRateLimited(e) ? tc("rateLimited") : t("errStart") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        {on ? <span className="tfa__on"><IconShieldCheck />{t("enabledBadge")}</span> : null}
      </div>
      <p className="advmuted" style={{ marginBottom: 12 }}>{t("desc")}</p>

      {stage === "sms" ? (
        <div className="cform" style={{ maxWidth: "none" }}>
          <div>
            <label>{t("codeLabel")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder={t("codePh")} autoFocus />
          </div>
          {demo ? <p className="rf__demo">{t("demoHint", { code: demo })}</p> : null}
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn--line btn--sm" type="button" onClick={reset}><IconChevronLeft />{t("back")}</button>
            <button className="btn btn--grad" type="button" onClick={verifySms} disabled={busy || code.trim().length < 4}>
              {busy ? t("verifying") : t("verify")}
            </button>
          </div>
        </div>
      ) : stage === "totp" && totp ? (
        <div className="cform" style={{ maxWidth: "none" }}>
          <b>{t("totpSetupTitle")}</b>
          <p className="advmuted" style={{ margin: 0 }}>{t("scanHint")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={totp.qrCode} alt="2FA QR" className="tfa__qr" />
          <div>
            <label>{t("secretLabel")}</label>
            <input value={totp.secret} readOnly onFocus={(e) => e.currentTarget.select()} className="tfa__secret" />
          </div>
          <div>
            <label>{t("codeLabel")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder={t("codePh")} autoFocus />
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn--line btn--sm" type="button" onClick={reset}><IconChevronLeft />{t("back")}</button>
            <button className="btn btn--grad" type="button" onClick={verifyTotp} disabled={busy || code.trim().length < 6}>
              {busy ? t("verifying") : t("verify")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          {on ? (
            <button className="btn btn--line btn--sm" type="button" onClick={disable} disabled={busy}>
              {busy ? t("disabling") : t("disable")}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn--pri btn--sm" type="button" onClick={startTotp} disabled={busy}>
                <IconShield />
                {t("chooseTotp")}
              </button>
              <button className="btn btn--line btn--sm" type="button" onClick={enableSms} disabled={busy}>
                {busy ? t("enableSending") : t("chooseSms")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
