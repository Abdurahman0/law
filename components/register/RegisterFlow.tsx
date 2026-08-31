"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import {
  emptyDraft,
  type AccountType,
  type ProfessionalProfile,
  type RegistrationDraft,
} from "@/lib/types";
import { LANGUAGE_KEYS, AREA_KEYS, REGION_KEYS } from "@/lib/mock/catalog";
import { ADVOCATE_DEFAULT_STATS } from "@/lib/mock/advocate";
import Select, { type Option } from "@/components/Select";
import { IconLogo, IconChevronLeft, IconArrowRight, IconCheck } from "../icons";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import AccountTypeCards from "./AccountTypeCards";
import ChipMulti from "./ChipMulti";
import PhotoUpload from "./PhotoUpload";
import ServiceSelector from "./ServiceSelector";
import WorkHistoryEditor from "./WorkHistoryEditor";
import StatsEditor from "./StatsEditor";
import ProfilePreview from "./ProfilePreview";

const STEPS_BY_TYPE: Record<AccountType, string[]> = {
  client: ["clientInfo"],
  lawyer: ["lawyerBasic", "lawyerServices"],
  advocate: ["personal", "professional", "experience", "expertise", "stats", "review"],
};

const ADV_STEPS = STEPS_BY_TYPE.advocate;

export default function RegisterFlow() {
  const t = useTranslations("register");
  const te = useTranslations("enums");
  const tl = useTranslations("register.languages");
  const router = useRouter();
  const { register } = useAuth();

  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft());
  const [idx, setIdx] = useState(0);
  const [creating, setCreating] = useState(false);

  const steps = useMemo(
    () => ["phone", "otp", "type", ...(draft.accountType ? STEPS_BY_TYPE[draft.accountType] : [])],
    [draft.accountType],
  );
  const step = steps[idx];
  const total = draft.accountType ? steps.length : steps.length + 2; // hint more to come

  const p = draft.profile;
  function setProfile(patch: Partial<ProfessionalProfile>) {
    setDraft((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
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
        stats: type === "advocate" ? { ...ADVOCATE_DEFAULT_STATS, casesWon: 0, totalCases: 0, clientsRepresented: 0, yearsPractice: 0, successRate: 0 } : d.profile.stats,
      },
    }));
    setIdx(3);
  }

  async function submit() {
    if (!draft.accountType) return;
    setCreating(true);
    try {
      const s = await register(draft, draft.password);
      router.replace(`/portal/${s.role}`);
    } catch {
      setCreating(false);
    }
  }

  const regionOpts: Option[] = REGION_KEYS.filter((r) => r !== "all").map((r) => ({
    value: r,
    label: te(`regions.${r}`),
  }));
  const langOpts = LANGUAGE_KEYS.map((l) => ({ value: l, label: tl(l) }));
  const areaOpts = AREA_KEYS.map((a) => ({ value: a, label: te(`areas.${a}`) }));

  const pwOk = draft.password.length >= 8;
  function canContinue(): boolean {
    switch (step) {
      case "clientInfo":
        return p.name.trim().length > 1 && pwOk;
      case "lawyerBasic":
        return p.name.trim().length > 1 && !!p.region && p.languages.length > 0 && pwOk;
      case "lawyerServices":
        return p.services.length > 0;
      case "personal":
        return p.name.trim().length > 1 && !!p.region && p.languages.length > 0 && pwOk;
      case "professional":
        return !!p.licenseNumber?.trim() && !!p.specialization?.trim();
      case "expertise":
        return p.practiceAreas.length > 0;
      default:
        return true;
    }
  }

  const isLast = idx === steps.length - 1 && !!draft.accountType;
  const showFooter = !["phone", "otp", "type"].includes(step);

  // Advocate mini-stepper index
  const advPos = ADV_STEPS.indexOf(step);

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

          {step === "otp" ? (
            <OtpStep
              phone={draft.phone}
              onVerified={() => {
                setDraft((d) => ({ ...d, phoneVerified: true }));
                next();
              }}
              onBack={back}
            />
          ) : null}

          {step === "type" ? (
            <div className="rf__step rf__step--wide">
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
                <div>
                  <label>{t("fields.name")}</label>
                  <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder={t("fields.namePh")} autoFocus />
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
                <div>
                  <label>{t("fields.name")}</label>
                  <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder={t("fields.namePh")} />
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
                  <label>{t("fields.languages")}</label>
                  <ChipMulti options={langOpts} value={p.languages} onChange={(v) => setProfile({ languages: v })} />
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
                    <label>{t("fields.name")}</label>
                    <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder={t("fields.namePh")} />
                  </div>
                  <div>
                    <label>{t("fields.email")}</label>
                    <input type="email" value={p.email ?? ""} onChange={(e) => setProfile({ email: e.target.value })} placeholder={t("fields.emailPh")} />
                  </div>
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("fields.phone")}</label>
                    <input value={draft.phone} readOnly className="rf__ro" />
                  </div>
                  <div>
                    <label>{t("fields.region")}</label>
                    <Select value={p.region ?? ""} onChange={(v) => setProfile({ region: v })} options={regionOpts} ariaLabel={t("fields.region")} placeholder={t("fields.regionPh")} />
                  </div>
                </div>
                <div>
                  <label>{t("fields.languages")}</label>
                  <ChipMulti options={langOpts} value={p.languages} onChange={(v) => setProfile({ languages: v })} />
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
                    <label>{t("advocate.experience")}</label>
                    <input type="number" min={0} value={p.experienceYears ?? ""} onChange={(e) => setProfile({ experienceYears: parseInt(e.target.value || "0", 10) || 0 })} placeholder={t("fields.experiencePh")} />
                  </div>
                </div>
                <div>
                  <label>{t("advocate.licenseDoc")}</label>
                  <PhotoUpload value={undefined} name="" onChange={() => setProfile({ licenseDoc: "license.pdf" })} label={t("advocate.upload")} hint={p.licenseDoc ? t("advocate.uploaded") : t("advocate.licenseHint")} />
                </div>
                <div className="cform__row2">
                  <div>
                    <label>{t("advocate.bar")}</label>
                    <input value={p.barAssociation ?? ""} onChange={(e) => setProfile({ barAssociation: e.target.value })} placeholder={t("advocate.barPh")} />
                  </div>
                  <div>
                    <label>{t("advocate.specialization")}</label>
                    <input value={p.specialization ?? ""} onChange={(e) => setProfile({ specialization: e.target.value })} placeholder={t("advocate.specializationPh")} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === "experience" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.work.title")}</h1>
              <p className="rf__sub">{t("advocate.work.subtitle")}</p>
              <WorkHistoryEditor value={p.workHistory} onChange={(v) => setProfile({ workHistory: v })} />
            </div>
          ) : null}

          {step === "expertise" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.expertiseTitle")}</h1>
              <p className="rf__sub">{t("advocate.expertiseSubtitle")}</p>
              <ChipMulti options={areaOpts} value={p.practiceAreas} onChange={(v) => setProfile({ practiceAreas: v })} />
            </div>
          ) : null}

          {step === "stats" ? (
            <div className="rf__step rf__step--wide">
              <h1 className="rf__title">{t("advocate.stats.title")}</h1>
              <p className="rf__sub">{t("advocate.stats.subtitle")}</p>
              <StatsEditor value={p.stats ?? ADVOCATE_DEFAULT_STATS} onChange={(v) => setProfile({ stats: v })} />
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
            {isLast ? (
              <button type="button" className="btn btn--grad btn--lg" onClick={submit} disabled={!canContinue()}>
                {draft.accountType === "advocate" ? t("advocate.review.submit") : t("finish")}
                <IconCheck />
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
