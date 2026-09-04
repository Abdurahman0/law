"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fmtNumber } from "@/lib/lexai";
import { useAuth } from "@/lib/auth";
import { IconInfo } from "../icons";

// Illustrative marketing pricing + discount calculator. The real, backend-driven
// plans and purchase flow live in the portal PlansPanel (/portal/{role}/subscription);
// the CTAs here funnel logged-in users straight into it and guests into register.
const BASE = { standard: 249000, premium: 549000 };

function calc(base: number, term: number, upfront: boolean) {
  let m = base;
  if (term === 12) m *= 0.9;
  if (upfront) m *= 0.9;
  m = Math.round(m / 1000) * 1000;
  return m;
}

export default function SubscriptionSection() {
  const t = useTranslations("subscription");
  const { session } = useAuth();
  const [term, setTerm] = useState(6);
  const [upfront, setUpfront] = useState(false);

  // Where "choose plan" sends the user: the real connected subscription panel.
  const buyHref = session ? `/portal/${session.role}/subscription` : "/register";

  function Plan({
    id,
    hot,
  }: {
    id: "standard" | "premium";
    hot?: boolean;
  }) {
    const base = BASE[id];
    const m = calc(base, term, upfront);
    const diff = base - m;
    const features = t.raw(`plans.${id}.features`) as string[];
    return (
      <article
        className={`plan${hot ? " plan--hot" : ""}`}
        data-badge={hot ? t("mostChosen") : undefined}
      >
        <h3 className="plan__h">{t(`plans.${id}.name`)}</h3>
        <p className="plan__for">{t(`plans.${id}.for`)}</p>
        <div className="plan__p">
          <b>{fmtNumber(m)}</b>
          <em>{t("perMonth")}</em>
          {diff > 0 ? <span className="old">{fmtNumber(base)}</span> : null}
          {diff > 0 ? (
            <span className="save">−{Math.round((diff / base) * 100)}%</span>
          ) : null}
        </div>
        <p className="plan__t">
          {t("totalFor", { term, total: fmtNumber(m * term) })}
          {diff > 0
            ? t("youSave", { amount: fmtNumber(diff * term) })
            : ""}
        </p>
        <ul>
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <Link
          href={buyHref}
          className={`btn ${id === "premium" ? "btn--grad" : "btn--line"} btn--full`}
        >
          {t(`plans.${id}.cta`)}
        </Link>
      </article>
    );
  }

  const gift = t.raw("plans.gift.features") as string[];

  return (
    <section className="sec" id="obuna" style={{ background: "var(--b50)" }}>
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
          <p className="lead">{t("lead")}</p>
        </div>

        <div className="switch" role="group">
          <button
            type="button"
            aria-pressed={term === 6}
            onClick={() => setTerm(6)}
          >
            {t("term6")}
          </button>
          <button
            type="button"
            aria-pressed={term === 12}
            onClick={() => setTerm(12)}
          >
            {t("term12")}
          </button>
        </div>
        <label className="chkline">
          <input
            type="checkbox"
            checked={upfront}
            onChange={(e) => setUpfront(e.target.checked)}
          />
          {t("upfront")}
        </label>

        <div className="plans">
          <Plan id="standard" />
          <Plan id="premium" hot />

          <article className="plan plan--card">
            <div className="mcard">
              <span className="mcard__chip" />
              <span>
                <b>{t("plans.gift.badge")}</b>
                <span>{t("plans.gift.badgeSub")}</span>
              </span>
            </div>
            <h3 className="plan__h" style={{ color: "#fff" }}>
              {t("plans.gift.name")}
            </h3>
            <p className="plan__for">{t("plans.gift.for")}</p>
            <div className="plan__p">
              <b style={{ color: "#fff" }}>{t("plans.gift.price")}</b>
              <em style={{ color: "#A8C3E8" }}>{t("plans.gift.priceUnit")}</em>
            </div>
            <p className="plan__t">{t("plans.gift.payNote")}</p>
            <ul style={{ color: "#DCE8FA" }}>
              {gift.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <Link href={buyHref} className="btn btn--grad btn--full">
              {t("plans.gift.cta")}
            </Link>
            <p className="quote">{t("plans.gift.quote")}</p>
          </article>
        </div>

        <div className="info">
          <IconInfo />
          <span>{t("ratingInfo")}</span>
        </div>
      </div>
    </section>
  );
}
