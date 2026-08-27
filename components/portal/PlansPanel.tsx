"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { PLANS, INVOICES } from "@/lib/mock/plans";
import { subscribe } from "@/lib/services/billing";
import type { PlanTier } from "@/lib/types";
import FDate from "@/components/FDate";
import { IconCheck, IconStar, IconShieldCheck } from "@/components/icons";

function som(n: number): string {
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}

export default function PlansPanel() {
  const t = useTranslations("plans");
  const { session, update } = useAuth();
  const [busy, setBusy] = useState<PlanTier | null>(null);
  const [done, setDone] = useState<PlanTier | null>(null);
  const current = session?.plan ?? "free";

  async function choose(tier: PlanTier) {
    if (tier === current || busy) return;
    setBusy(tier);
    setDone(null);
    const res = await subscribe(tier);
    setBusy(null);
    if (res.ok) {
      update({ plan: tier });
      setDone(tier);
    }
  }

  return (
    <div className="subs">
      <div className="plans__head">
        <div>
          <h2 className="psec-h">{t("title")}</h2>
          <p className="plans__sub">{t("subtitle")}</p>
        </div>
        <span className="plans__current">
          <IconShieldCheck />
          {t("currentPlan", { plan: t(`${current}.name`) })}
        </span>
      </div>

      {done ? <div className="plans__toast">{t("activated", { plan: t(`${done}.name`) })}</div> : null}

      <div className="plans__grid">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === current;
          const features = t.raw(`${plan.tier}.features`) as string[];
          return (
            <div
              key={plan.tier}
              className={`splan${plan.featured ? " splan--feat" : ""}${isCurrent ? " splan--current" : ""}`}
            >
              {plan.featured ? <span className="splan__ribbon">{t("mostPopular")}</span> : null}
              <div className="splan__h">
                <b className="splan__name">
                  {plan.badge ? <IconStar /> : null}
                  {t(`${plan.tier}.name`)}
                </b>
                <span className="splan__tag">{t(`${plan.tier}.tagline`)}</span>
              </div>
              <div className="splan__price">
                {plan.monthly === 0 ? (
                  <b>{t("freeLabel")}</b>
                ) : (
                  <>
                    <b>{som(plan.monthly)}</b>
                    <span>{t("perMonth")}</span>
                  </>
                )}
              </div>
              <ul className="splan__feats">
                {features.map((f, i) => (
                  <li key={i}>
                    <IconCheck />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn ${plan.featured ? "btn--grad" : "btn--line"} btn--full`}
                disabled={isCurrent || busy === plan.tier}
                onClick={() => choose(plan.tier)}
              >
                {isCurrent
                  ? t("current")
                  : busy === plan.tier
                    ? t("processing")
                    : plan.monthly === 0
                      ? t("downgrade")
                      : t("upgrade")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("billing.title")}</b>
        </div>
        <div className="ptable">
          <div className="ptable__head">
            <span>{t("billing.invoice")}</span>
            <span>{t("billing.date")}</span>
            <span>{t("billing.amount")}</span>
            <span>{t("billing.status")}</span>
          </div>
          {INVOICES.map((inv) => (
            <div className="ptable__row" key={inv.id}>
              <span data-l={t("billing.invoice")}>{inv.id}</span>
              <span data-l={t("billing.date")}>
                <FDate v={inv.date} />
              </span>
              <span data-l={t("billing.amount")}>{som(inv.amount)}</span>
              <span data-l={t("billing.status")}>
                <em className={`pstate pstate--${inv.state}`}>{t(`states.${inv.state}`)}</em>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
