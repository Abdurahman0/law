"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { start2fa, verify2fa, disable2fa } from "@/lib/services/backend";
import { Notice } from "@/components/admin/AdminBits";
import { IconShield, IconShieldCheck } from "@/components/icons";

// SMS/OTP two-factor management. Backend has no status endpoint, so the
// enabled flag is remembered locally after enable/disable actions.
export default function TwoFactorCard() {
  const t = useTranslations("portal.common.twofa");
  const { session } = useAuth();
  const storeKey = `lexgo_2fa_${session?.id || "anon"}`;
  const [on, setOn] = useState(false);
  const [stage, setStage] = useState<"idle" | "code">("idle");
  const [vid, setVid] = useState("");
  const [demo, setDemo] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    setOn(localStorage.getItem(storeKey) === "1");
  }, [storeKey]);

  async function enable() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await start2fa();
      setVid(r.verificationId);
      setDemo(r.demoOtp);
      setCode(r.demoOtp || "");
      setStage("code");
    } catch {
      setNote({ ok: false, msg: t("errStart") });
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    if (busy || code.trim().length < 4) return;
    setBusy(true);
    setNote(null);
    try {
      await verify2fa(vid, code.trim());
      localStorage.setItem(storeKey, "1");
      setOn(true);
      setStage("idle");
      setNote({ ok: true, msg: t("enabled") });
    } catch {
      setNote({ ok: false, msg: t("errVerify") });
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
      setOn(false);
      setStage("idle");
      setNote({ ok: true, msg: t("disabledMsg") });
    } catch {
      setNote({ ok: false, msg: t("errStart") });
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

      {stage === "code" ? (
        <div className="cform" style={{ maxWidth: "none" }}>
          <div>
            <label>{t("codeLabel")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder={t("codePh")} />
          </div>
          {demo ? <p className="rf__demo">{t("demoHint", { code: demo })}</p> : null}
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--grad btn--full" type="button" onClick={verify} disabled={busy || code.trim().length < 4}>
            {busy ? t("verifying") : t("verify")}
          </button>
        </div>
      ) : (
        <>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          {on ? (
            <button className="btn btn--line btn--sm" type="button" onClick={disable} disabled={busy}>
              {busy ? t("disabling") : t("disable")}
            </button>
          ) : (
            <button className="btn btn--pri btn--sm" type="button" onClick={enable} disabled={busy}>
              <IconShield />
              {busy ? t("enableSending") : t("enable")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
