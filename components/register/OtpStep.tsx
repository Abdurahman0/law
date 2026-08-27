"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  verifyCode,
  resendCode,
  OTP_LENGTH,
  RESEND_COOLDOWN_SEC,
  DEMO_CODE,
} from "@/lib/services/sms";
import { IconCheck, IconRefresh, IconChevronLeft } from "../icons";

type Status = "idle" | "sent" | "verifying" | "verified" | "incorrect" | "expired" | "locked";

export default function OtpStep({
  phone,
  onVerified,
  onBack,
}: {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("register.otp");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("sent");
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SEC);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  async function verify(code: string) {
    setStatus("verifying");
    const r = await verifyCode(phone, code);
    if (r === "verified") {
      setStatus("verified");
      setTimeout(onVerified, 700);
    } else {
      setStatus(r);
    }
  }

  function setAt(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (!clean && v) return;
    const next = [...digits];
    if (clean.length > 1) {
      // paste
      clean.split("").slice(0, OTP_LENGTH).forEach((c, k) => (next[k] = c));
      setDigits(next);
      const filled = next.join("");
      if (filled.length === OTP_LENGTH) verify(filled);
      else refs.current[Math.min(clean.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    next[i] = clean;
    setDigits(next);
    if (status === "incorrect" || status === "expired") setStatus("sent");
    if (clean && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    const filled = next.join("");
    if (filled.length === OTP_LENGTH && !next.includes("")) verify(filled);
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function resend() {
    if (resendIn > 0) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setStatus("sent");
    setResendIn(RESEND_COOLDOWN_SEC);
    await resendCode(phone);
    refs.current[0]?.focus();
  }

  const msg =
    status === "verified"
      ? { cls: "ok", text: t("verified") }
      : status === "verifying"
        ? { cls: "muted", text: t("verifying") }
        : status === "incorrect"
          ? { cls: "err", text: t("incorrect") }
          : status === "expired"
            ? { cls: "err", text: t("expired") }
            : status === "locked"
              ? { cls: "err", text: t("locked") }
              : null;

  return (
    <div className="rf__step">
      <span className={`rf__ico ${status === "verified" ? "rf__ico--ok" : "rf__ico--brand"}`}>
        {status === "verified" ? <IconCheck /> : <span className="rf__otpnum">{OTP_LENGTH}</span>}
      </span>
      <h1 className="rf__title">{t("title")}</h1>
      <p className="rf__sub">{t("subtitle", { phone })}</p>

      <div className={`otp${status === "verified" ? " otp--ok" : ""}${status === "incorrect" || status === "expired" ? " otp--err" : ""}`}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="otp__box"
            inputMode="numeric"
            maxLength={i === 0 ? OTP_LENGTH : 1}
            value={d}
            disabled={status === "verifying" || status === "verified"}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            aria-label={`digit ${i + 1}`}
          />
        ))}
      </div>

      {msg ? <p className={`rf__otpmsg rf__otpmsg--${msg.cls}`}>{msg.text}</p> : null}

      <p className="rf__demo">{t("demoHint", { code: DEMO_CODE })}</p>

      <div className="rf__otpactions">
        <button
          type="button"
          className="rf__link"
          onClick={resend}
          disabled={resendIn > 0}
        >
          <IconRefresh />
          {resendIn > 0 ? t("resendIn", { sec: resendIn }) : t("resend")}
        </button>
        <button type="button" className="rf__link rf__link--muted" onClick={onBack}>
          <IconChevronLeft />
          {t("change")}
        </button>
      </div>
    </div>
  );
}
