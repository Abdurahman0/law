"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useAuth, type Role } from "@/lib/auth";
import { useRouter } from "@/i18n/navigation";
import { IconLogo } from "../icons";

export default function LoginForm() {
  const t = useTranslations("portal.login");
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr(true);
      return;
    }
    login({ role, name: name.trim(), phone: phone.trim() });
    router.replace(`/portal/${role}`);
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

        <div className="cform" style={{ maxWidth: "none" }}>
          <div>
            <label htmlFor="l-name">{t("name")}</label>
            <input
              id="l-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePh")}
            />
          </div>
          <div>
            <label htmlFor="l-phone">{t("phone")}</label>
            <input
              id="l-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePh")}
            />
          </div>
          {err ? (
            <p style={{ color: "#C0392B", fontSize: ".85rem", margin: 0 }}>
              {t("required")}
            </p>
          ) : null}
          <button className="btn btn--pri btn--full" type="submit">
            {t("submit")}
          </button>
        </div>
        <p className="plogin__note">{t("note")}</p>
      </form>
    </div>
  );
}
