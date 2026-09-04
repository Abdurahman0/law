"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useAuth, type Role } from "@/lib/auth";
import { Link, useRouter } from "@/i18n/navigation";
import { IconLogo } from "../icons";

const ROLES: Role[] = ["client", "lawyer", "advocate"];
const cap = (r: Role) => (r === "advocate" ? "Advocate" : r === "lawyer" ? "Lawyer" : "Client");

export default function LoginForm() {
  const t = useTranslations("portal.login");
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      const s = await login(p, password, {
        role,
        name: t(`role${cap(role)}`),
      });
      router.replace(`/portal/${s.role}`);
    } catch {
      setErr(t("failed"));
      setBusy(false);
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
        <h1 style={{ marginTop: 18 }}>{t("title")}</h1>
        <p className="sub">{t("subtitle")}</p>

        <div className="plogin__roles plogin__roles--3">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className={`prole prole--slim${role === r ? " on" : ""}`}
              onClick={() => setRole(r)}
            >
              <b>{t(`role${cap(r)}`)}</b>
            </button>
          ))}
        </div>

        <div className="cform" style={{ maxWidth: "none" }}>
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
              autoComplete="current-password"
            />
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
