"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import {
  emptyDraft,
  type AccountType,
  type AdvocateStats,
  type ProfessionalProfile,
  type RegistrationDraft,
} from "@/lib/types";
import { REGION_KEYS } from "@/lib/mock/catalog";
import Select, { type Option } from "@/components/Select";
import { IconLogo, IconChevronLeft, IconArrowRight, IconCheck } from "../icons";
import PhoneStep from "./PhoneStep";
import AccountTypeCards from "./AccountTypeCards";
import PhotoUpload from "./PhotoUpload";
import ServiceSelector from "./ServiceSelector";
import ProfilePreview from "./ProfilePreview";

const ZERO_STATS: AdvocateStats = {
  totalCases: 0,
  casesWon: 0,
  successRate: 0,
  yearsPractice: 0,
  clientsRepresented: 0,
};

const STEPS_BY_TYPE: Record<AccountType, string[]> = {
  client: ["clientInfo"],
  lawyer: ["lawyerBasic", "lawyerServices"],
  // NOTE: "experience", "expertise" and "stats" steps were pulled out of
  // registration — they belong in the advocate profile editor. See
  // ADVOCATE_PROFILE_TODO.md before re-adding them anywhere.
  advocate: ["personal", "professional", "review"],
};

const ADV_STEPS = STEPS_BY_TYPE.advocate;

export default function RegisterFlow() {
  const t = useTranslations("register");
  const te = useTranslations("enums");
  const router = useRouter();
  const { startRegistration, register, session, ready } = useAuth();

  // Already signed in → registration is off-limits until logout.
  useEffect(() => {
    if (ready && session) router.replace(`/portal/${session.role}`);
  }, [ready, session, router]);

  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft());
  const [idx, setIdx] = useState(0);
  const [creating, setCreating] = useState(false);

  // OTP verification state
  const [verificationId, setVerificationId] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [code, setCode] = useState("");
  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);

  const steps = useMemo(
    () => ["phone", "type", ...(draft.accountType ? [...STEPS_BY_TYPE[draft.accountType], "verify"] : [])],
    [draft.accountType],
  );
  const step = steps[idx];
  const total = draft.accountType ? steps.length : steps.length + 3; // hint more to come

  const p = draft.profile;
  function setProfile(patch: Partial<ProfessionalProfile>) {
    setDraft((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  }
  // First/last name are two inputs; keep `name` in sync for backend + display.
  function setName(patch: { firstName?: string; lastName?: string }) {
    setDraft((d) => {
      const firstName = (patch.firstName ?? d.profile.firstName ?? "").trimStart();
      const lastName = (patch.lastName ?? d.profile.lastName ?? "").trimStart();
      return {
        ...d,
        profile: { ...d.profile, firstName, lastName, name: `${firstName} ${lastName}`.trim() },
      };
    });
  }

  const pwField = (
    <div>
      <label>{t("fields.password")}</label>
      <input
        type="password"
        value={draft.password}
        onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
        placeholder={t("fields.passwordPh")}
        autoComplete="new-password"
      />
      <p className="rf__hint">{t("fields.passwordHint")}</p>
    </div>
  );

  function next() {
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  }
  function back() {
    setIdx((i) => Math.max(i - 1, 0));
  }
  function chooseType(type: AccountType) {
    setDraft((d) => ({
      ...d,
      accountType: type,
      profile: {
        ...d.profile,
        stats: type === "advocate" ? ZERO_STATS : d.profile.stats,
      },
    }));
    setIdx(2);
  }

  // Last profile step → request the OTP, then advance to the verify step.
  async function startReg() {
    if (!draft.accountType || starting) return;
    setStarting(true);
    setVerifyErr(null);
    try {
      const { verificationId: vid, demoOtp: otp } = await startRegistration(draft);
      setVerificationId(vid);
      setDemoOtp(otp);
      setCode(otp || "");
      setStarting(false);
      next();
    } catch {
      setStarting(false);
      setVerifyErr(t("verify.startError"));
    }
  }

  // Verify step → confirm the code, create the session, go to the portal.
  async function doVerify() {
    if (verifying) return;
    if (code.trim().length < 4) {
      setVerifyErr(t("verify.incorrect"));
      return;
    }
    setVerifying(true);
    setVerifyErr(null);
    setCreating(true);
    try {
      const s = await register(draft, verificationId, code.trim());
      // Seller roles come back pending admin approval — show a review screen
      // instead of entering a portal (no account exists yet).
      if ("pending" in s) {
        setPendingMsg(s.message);
        return;
      }
      router.replace(`/portal/${s.role}`);
    } catch {
      setVerifying(false);
      setCreating(false);
      setVerifyErr(t("verify.incorrect"));
    }
  }

  const regionOpts: Option[] = REGION_KEYS.filter((r) => r !== "all").map((r) => ({
    value: r,
    label: te(`regions.${r}`),
  }));
  const specOpts: Option[] = (["criminalAdmin", "economicCivil", "both"] as const).map((k) => ({
    value: k,
    label: t(`advocate.specOptions.${k}`),
  }));

  const pwOk = draft.password.length >= 8;
  const nameOk = !!p.firstName?.trim() && !!p.lastName?.trim();
  function canContinue(): boolean {
    switch (step) {
      case "clientInfo":
        return nameOk && pwOk;
      case "lawyerBasic":
        return nameOk && !!p.region && pwOk;
      case "lawyerServices":
        return p.services.length > 0;
      case "personal":
        return nameOk && !!p.region && pwOk;
      case "professional":
        return !!p.licenseNumber?.trim() && !!p.specialization?.trim();
      default:
        return true;
    }
  }

  // The last profile step is right before "verify".
  const lastProfileStep = !!draft.accountType && idx === steps.length - 2;
  const showFooter = !["phone", "type", "verify"].includes(step);

  // Advocate mini-stepper index
  const advPos = ADV_STEPS.indexOf(step);

  // Seller registration submitted → awaiting admin approval.
  if (pendingMsg) {
    return (
      <div className="rf">
        <div className="rf__bg" />
        <div className="rf__card">
          <div className="rf__step" style={{ textAlign: "center", alignItems: "center" }}>
            <span className="rf__ico rf__ico--brand">
              <IconCheck />
            </span>
            <h1 className="rf__title">{t("pending.title")}</h1>
            <p className="rf__sub">{pendingMsg}</p>
            <p className="rf__sub">{t("pending.hint")}</p>
            <button
              className="btn btn--grad btn--full btn--lg"
              type="button"
              onClick={() => router.replace("/login")}
              style={{ marginTop: 18 }}
            >
              {t("pending.toLogin")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rf">
      <div className="rf__bg" />
      <div className="rf__card">
        <div className="rf__top">
          <span className="rf__logo">
            <span className="logo__m">
              <IconLogo />
            </span>
            LexGo
          </span>
          {draft.accountType ? (
            <span className="rf__step-n">{t("progress", { n: idx + 1, total })}</span>
          ) : null}
        </div>
        <div className="rf__bar">
          <span style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>

        {draft.accountType === "advocate" && advPos >= 0 ? (
          <div className="rf__stepper">
            {ADV_STEPS.map((s, i) => (
              <span
                key={s}
                className={`rf__stepper-i${i === advPos ? " on" : ""}${i < advPos ? " done" : ""}`}
              >
                <i>{i < advPos ? <IconCheck /> : i + 1}</i>
                {t(`advocate.steps.${s}`)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rf__body">
          {step === "phone" ? (
            <PhoneStep
              phone={draft.phone}
              onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
              onSent={next}
            />
          ) : null}

          {step === "verify" ? (
            <div className="rf__step">
              <span className="rf__ico rf__ico--brand">
                <span className="rf__otpnum">6</span>
              </span>
              <h1 className="rf__title">{t("verify.title")}</h1>
              <p className="rf__sub">{t("verify.subtitle", { phone: draft.phone })}</p>
              <div className="otp">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    className="otp__box"
                    inputMode="numeric"
                    maxLength={i === 0 ? 6 : 1}
                    value={code[i] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (i === 0 && v.length > 1) {
                        setCode(v.slice(0, 6));
                        return;
                      }
                      const arr = code.padEnd(6, " ").split("");
                      arr[i] = v.slice(-1) || " ";
                      setCode(arr.join("").replace(/\s/g, ""));
                    }}
                    aria-label={`digit ${i + 1}`}
                  />
                ))}
              </div>
              {verifyErr ? <p className="rf__otpmsg rf__otpmsg--err">{verifyErr}</p> : null}
              {demoOtp ? <p className="rf__demo">{t("verify.demoHint", { code: demoOtp })}</p> : null}
              <button className="btn btn--grad btn--full btn--lg" type="button" onClick={doVerify} disabled={verifying} style={{ marginTop: 18 }}>
                {verifying ? t("verify.verifying") : t("verify.submit")}
                {verifying ? null : <IconCheck />}
              </button>
              <button type="button" className="rf__link rf__link--muted" onClick={back} style={{ marginTop: 14 }}>
                <IconChevronLeft />
                {t("verify.change")}
              </button>
            </div>
          ) : null}

          {step === "type" ? (
            <div className="rf__step rf__step--wide">
              <button type="button" className="rf__back" onClick={back}>
                <IconChevronLeft />
                {t("back")}
              </button>
              <h1 className="rf__title">{t("type.title")}</h1>
              <p className="rf__sub">{t("type.subtitle")}</p>
              <AccountTypeCards onChoose={chooseType} />
            </div>
          ) : null}

          {step === "clientInfo" ? (
            <div className="rf__step">
              <h1 className="rf__title">{t("client.title")}</h1>
              <p className="rf__sub">{t("client.subtitle")}</p>
              <div className="cform" style={{ maxWidth: "none", marginTop: 20 }}>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.firstName")}</label>
                    <input value={p.firstName ?? ""} onChange={(e) => setName({ firstName: e.target.value })} placeholder={t("fields.firstNamePh")} autoFocus />
                  </div>
                  <div>
                    <label>{t("fields.lastName")}</label>
                    <input value={p.lastName ?? ""} onChange={(e) => setName({ lastName: e.target.value })} placeholder={t("fields.lastNamePh")} />
                  </div>
                </div>
                <div>
                  <label>
                    {t("fields.email")} <span className="rf__opt">{t("optional")}</span>
                  </label>
                  <input type="email" value={p.email ?? ""} onChange={(e) => setProfile({ email: e.target.value })} placeholder={t("fields.emailPh")} />
                </div>
                {pwField}
              </div>
              <p className="rf__wow">{t("client.wow")}</p>
            </div>
          ) : null}

          {step === "lawyerBasic" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("lawyer.basicTitle")}</h1>
              <p className="rf__sub">{t("lawyer.basicSubtitle")}</p>
              <PhotoUpload value={p.photo} name={p.name} onChange={(u) => setProfile({ photo: u })} label={t("fields.photo")} hint={t("fields.photoHint")} />
              <div className="cform" style={{ maxWidth: "none" }}>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.firstName")}</label>
                    <input value={p.firstName ?? ""} onChange={(e) => setName({ firstName: e.target.value })} placeholder={t("fields.firstNamePh")} />
                  </div>
                  <div>
                    <label>{t("fields.lastName")}</label>
                    <input value={p.lastName ?? ""} onChange={(e) => setName({ lastName: e.target.value })} placeholder={t("fields.lastNamePh")} />
                  </div>
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.region")}</label>
                    <Select value={p.region ?? ""} onChange={(v) => setProfile({ region: v })} options={regionOpts} ariaLabel={t("fields.region")} placeholder={t("fields.regionPh")} />
                  </div>
                  <div>
                    <label>{t("fields.experience")}</label>
                    <input type="number" min={0} value={p.experienceYears ?? ""} onChange={(e) => setProfile({ experienceYears: parseInt(e.target.value || "0", 10) || 0 })} placeholder={t("fields.experiencePh")} />
                  </div>
                </div>
                <div>
                  <label>{t("fields.education")}</label>
                  <input value={p.education ?? ""} onChange={(e) => setProfile({ education: e.target.value })} placeholder={t("fields.educationPh")} />
                </div>
                <div>
                  <label>{t("fields.bio")}</label>
                  <textarea rows={3} value={p.bio ?? ""} onChange={(e) => setProfile({ bio: e.target.value })} placeholder={t("fields.bioPh")} />
                </div>
                {pwField}
              </div>
            </div>
          ) : null}

          {step === "lawyerServices" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("lawyer.servicesTitle")}</h1>
              <p className="rf__sub">{t("lawyer.servicesSubtitle")}</p>
              <div className="rf__match">
                <IconArrowRight />
                {t("lawyer.matchNote")}
              </div>
              <ServiceSelector value={p.services} onChange={(v) => setProfile({ services: v })} />
            </div>
          ) : null}

          {step === "personal" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.personalTitle")}</h1>
              <p className="rf__sub">{t("advocate.personalSubtitle")}</p>
              <PhotoUpload value={p.photo} name={p.name} onChange={(u) => setProfile({ photo: u })} label={t("fields.photo")} hint={t("fields.photoHint")} />
              <div className="cform" style={{ maxWidth: "none" }}>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.firstName")}</label>
                    <input value={p.firstName ?? ""} onChange={(e) => setName({ firstName: e.target.value })} placeholder={t("fields.firstNamePh")} />
                  </div>
                  <div>
                    <label>{t("fields.lastName")}</label>
                    <input value={p.lastName ?? ""} onChange={(e) => setName({ lastName: e.target.value })} placeholder={t("fields.lastNamePh")} />
                  </div>
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.email")}</label>
                    <input type="email" value={p.email ?? ""} onChange={(e) => setProfile({ email: e.target.value })} placeholder={t("fields.emailPh")} />
                  </div>
                  <div>
                    <label>{t("fields.phone")}</label>
                    <input value={draft.phone} readOnly className="rf__ro" />
                  </div>
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.region")}</label>
                    <Select value={p.region ?? ""} onChange={(v) => setProfile({ region: v })} options={regionOpts} ariaLabel={t("fields.region")} placeholder={t("fields.regionPh")} />
                  </div>
                  <div />
                </div>
                {pwField}
              </div>
            </div>
          ) : null}

          {step === "professional" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.professionalTitle")}</h1>
              <p className="rf__sub">{t("advocate.professionalSubtitle")}</p>
              <div className="cform" style={{ maxWidth: "none" }}>
                <div className="cform__row2">
                  <div>
                    <label>{t("advocate.license")}</label>
                    <input value={p.licenseNumber ?? ""} onChange={(e) => setProfile({ licenseNumber: e.target.value })} placeholder={t("advocate.licensePh")} />
                  </div>
                  <div>
                    <label>{t("advocate.specialization")}</label>
                    <Select value={p.specialization ?? ""} onChange={(v) => setProfile({ specialization: v })} options={specOpts} ariaLabel={t("advocate.specialization")} placeholder={t("advocate.specPlaceholder")} />
                  </div>
                </div>
                <div>
                  <label>{t("advocate.licenseDoc")}</label>
                  <PhotoUpload value={undefined} name="" onChange={() => setProfile({ licenseDoc: "license.pdf" })} label={t("advocate.upload")} hint={p.licenseDoc ? t("advocate.uploaded") : t("advocate.licenseHint")} />
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("advocate.advExp")}</label>
                    <input type="number" min={0} value={p.advocateYears ?? ""} onChange={(e) => setProfile({ advocateYears: parseInt(e.target.value || "0", 10) || 0 })} placeholder={t("fields.experiencePh")} />
                  </div>
                  <div>
                    <label>{t("advocate.lawExp")}</label>
                    <input type="number" min={0} value={p.lawyerYears ?? ""} onChange={(e) => setProfile({ lawyerYears: parseInt(e.target.value || "0", 10) || 0 })} placeholder={t("fields.experiencePh")} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.review.title")}</h1>
              <p className="rf__sub">{t("advocate.review.subtitle")}</p>
              <div className="rf__previewnote">{t("advocate.review.previewNote")}</div>
              <ProfilePreview p={p} />
            </div>
          ) : null}
        </div>

        {showFooter ? (
          <div className="rf__foot">
            <button type="button" className="btn btn--ghost" onClick={back}>
              <IconChevronLeft />
              {t("back")}
            </button>
            {lastProfileStep ? (
              <button type="button" className="btn btn--grad btn--lg" onClick={startReg} disabled={!canContinue() || starting}>
                {starting ? t("verify.sending") : t("verify.getCode")}
                {starting ? null : <IconArrowRight />}
              </button>
            ) : (
              <button type="button" className="btn btn--grad btn--lg" onClick={next} disabled={!canContinue()}>
                {t("continue")}
                <IconArrowRight />
              </button>
            )}
          </div>
        ) : null}
      </div>

      {creating ? (
        <div className="rf__creating">
          <div className="rf__creating-c">
            <span className="rf__spinner" />
            <b>{t("done.creating")}</b>
          </div>
        </div>
      ) : null}
    </div>
  );
}
