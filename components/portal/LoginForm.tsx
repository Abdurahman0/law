"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useAuth, type Role } from "@/lib/auth";
import { useRouter } from "@/i18n/navigation";
import { IconLogo } from "../icons";

type Mode = "login" | "register";

export default function LoginForm() {
  const t = useTranslations("portal.login");
  const { login, register } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const p = phone.trim();
    const pw = password;
    if (!p || !pw || (mode === "register" && !name.trim())) {
      setErr(t("required"));
      return;
    }
    if (mode === "register" && pw.length < 8) {
      setErr(t("passwordShort"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const s =
        mode === "login"
          ? await login(p, pw)
          : await register({ role, name: name.trim(), phone: p, password: pw });
      router.replace(`/portal/${s.role}`);
    } catch (e) {
      setErr(
        mode === "login" ? t("failedLogin") : t("failedRegister"),
      );
      setBusy(false);
      // eslint-disable-next-line no-console
      console.error("[auth]", e);
    }
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
        <h1 style={{ marginTop: 18 }}>
          {mode === "login" ? t("titleLogin") : t("titleRegister")}
        </h1>
        <p className="sub">{t("subtitle")}</p>

        <div className="plogin__tabs">
          <button
            type="button"
            className={`plogin__tab${mode === "login" ? " on" : ""}`}
            onClick={() => {
              setMode("login");
              setErr(null);
            }}
          >
            {t("tabLogin")}
          </button>
          <button
            type="button"
            className={`plogin__tab${mode === "register" ? " on" : ""}`}
            onClick={() => {
              setMode("register");
              setErr(null);
            }}
          >
            {t("tabRegister")}
          </button>
        </div>

        {mode === "register" ? (
          <div className="plogin__roles">
            <button
              type="button"
              className={`prole${role === "client" ? " on" : ""}`}
              onClick={() => setRole("client")}
            >
              <b>{t("roleClient")}</b>
              <span>{t("roleClientHint")}</span>
            </button>
            <button
              type="button"
              className={`prole${role === "lawyer" ? " on" : ""}`}
              onClick={() => setRole("lawyer")}
            >
              <b>{t("roleLawyer")}</b>
              <span>{t("roleLawyerHint")}</span>
            </button>
          </div>
        ) : null}

        <div className="cform" style={{ maxWidth: "none" }}>
          {mode === "register" ? (
            <div>
              <label htmlFor="l-name">{t("name")}</label>
              <input
                id="l-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePh")}
                autoComplete="name"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="l-phone">{t("phone")}</label>
            <input
              id="l-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePh")}
              autoComplete="tel"
            />
          </div>
          <div>
            <label htmlFor="l-pw">{t("password")}</label>
            <input
              id="l-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPh")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {err ? (
            <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>{err}</p>
          ) : null}
          <button
            className="btn btn--pri btn--full"
            type="submit"
            disabled={busy}
          >
            {busy
              ? t("busy")
              : mode === "login"
                ? t("submitLogin")
                : t("submitRegister")}
          </button>
        </div>
        <p className="plogin__note">{t("note")}</p>
      </form>
    </div>
  );
}
