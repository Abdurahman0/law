"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getSubscriptionPlans,
  demoPlanPurchase,
  listPayments,
  type BackendPlan,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { IconCheck, IconCard, IconGift } from "@/components/icons";

type Term = 1 | 6 | 12;
type Variant = "personal" | "all";

// Module 6 "Shaxsiy advokat" tariffs. When a client opens their subscription
// we show only these two plans (+ gift) with the TZ feature copy; sellers keep
// the full plan list (LexGo.AI, business, etc.).
const PERSONAL_SLUGS = ["shaxsiy-advokat-standard", "shaxsiy-advokat-premium"] as const;
const SLUG_KEY: Record<string, "standard" | "premium"> = {
  "shaxsiy-advokat-standard": "standard",
  "shaxsiy-advokat-premium": "premium",
};

function som(n: number): string {
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}
function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
}
// TZ pricing: monthly base, 6-month, yearly (−10%/mo), prepaid-yearly (−10% more).
function pricing(plan: BackendPlan, term: Term, upfront: boolean) {
  const monthly = plan.monthlyPrice;
  const total = term === 1 ? monthly : term === 6 ? plan.sixMonthPrice : upfront ? plan.prepaidYearlyPrice : plan.yearlyPrice;
  const perMonth = term && total ? Math.round(total / term) : monthly;
  const baseline = monthly * term;
  const savePct = baseline && total ? Math.round(((baseline - total) / baseline) * 100) : 0;
  return { perMonth, total, savePct };
}

export default function PlansPanel({ variant = "all" }: { variant?: Variant }) {
  const t = useTranslations("plans");
  const ts = useTranslations("subscription");
  const personal = variant === "personal";
  const res = useResource<BackendPlan>(getSubscriptionPlans, []);
  const payments = useResource(listPayments, []);
  // Module 6 subscriptions run 6 or 12 months only; sellers can still go monthly.
  const [term, setTerm] = useState<Term>(6);
  const [upfront, setUpfront] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const bills = payments.data.filter((p) => !p.kind || p.kind === "subscription");

  // For the client view, keep only the personal-advocate tariffs, in order.
  const plans = personal
    ? (PERSONAL_SLUGS.map((s) => res.data.find((p) => p.slug === s)).filter(Boolean) as BackendPlan[])
    : res.data;

  function planName(plan: BackendPlan) {
    const key = SLUG_KEY[plan.slug];
    return plan.name || (personal && key ? ts(`plans.${key}.name`) : plan.name);
  }
  // For the module-6 personal tariffs the TZ feature copy is authoritative, so
  // use it whenever we recognise the slug (backend only ships sparse/placeholder
  // features). Other plans fall back to whatever the backend returns.
  function planFeatures(plan: BackendPlan): string[] {
    const key = SLUG_KEY[plan.slug];
    if (personal && key) return ts.raw(`plans.${key}.features`) as string[];
    return plan.features ?? [];
  }

  async function choose(plan: BackendPlan) {
    if (busy) return;
    setBusy(plan.id);
    setMsg(null);
    try {
      const r = await demoPlanPurchase(plan.id);
      if (r.paymentUrl) {
        // Checkout opens in a new tab — the plan is NOT active until paid.
        window.open(r.paymentUrl, "_blank");
        setMsg({ ok: true, text: t("payRedirect") });
      } else {
        setMsg({ ok: true, text: t("activated", { plan: planName(plan) }) });
      }
    } catch {
      setMsg({ ok: false, text: t("purchaseError") });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="subs">
      <div className="plans__head">
        <div>
          <h2 className="psec-h">{t("title")}</h2>
          <p className="plans__sub">{t("subtitle")}</p>
        </div>
        <div className="switch switch--sm" role="group">
          {personal ? null : (
            <button type="button" aria-pressed={term === 1} onClick={() => setTerm(1)}>{t("term1")}</button>
          )}
          <button type="button" aria-pressed={term === 6} onClick={() => setTerm(6)}>{t("term6")}</button>
          <button type="button" aria-pressed={term === 12} onClick={() => setTerm(12)}>{t("term12")}</button>
        </div>
      </div>

      {term === 12 ? (
        <label className="chkline">
          <input type="checkbox" checked={upfront} onChange={(e) => setUpfront(e.target.checked)} />
          {t("upfront")}
        </label>
      ) : null}

      {msg ? <div className={`plans__toast${msg.ok ? "" : " plans__toast--err"}`}>{msg.text}</div> : null}

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !plans.length ? (
        <EmptyState icon={<IconCard />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="plans__grid">
          {plans.map((plan, i) => {
            const pr = pricing(plan, term, upfront);
            const feats = planFeatures(plan);
            return (
              <div key={plan.id} className={`splan${i === 1 ? " splan--feat" : ""}`}>
                <div className="splan__h">
                  <b className="splan__name">{planName(plan)}</b>
                  {pr.savePct > 0 ? <span className="splan__save">−{pr.savePct}%</span> : null}
                </div>
                <div className="splan__price">
                  {plan.monthlyPrice === 0 ? (
                    <b>{t("freeLabel")}</b>
                  ) : (
                    <>
                      <b>{som(pr.perMonth)}</b>
                      <span>{t("perMonth")}</span>
                    </>
                  )}
                </div>
                {plan.monthlyPrice > 0 && term > 1 ? (
                  <p className="splan__total">{t("totalNote", { term, total: som(pr.total) })}</p>
                ) : null}
                <ul className="splan__feats">
                  {feats.map((f, k) => (
                    <li key={k}>
                      <IconCheck />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn ${i === 1 ? "btn--grad" : "btn--line"} btn--full`}
                  disabled={busy === plan.id}
                  onClick={() => choose(plan)}
                >
                  {busy === plan.id ? t("processing") : t("choose")}
                </button>
              </div>
            );
          })}

          {/* Gift tariff (module 6): pay 3/6/12 months up front, send a QR link. */}
          {personal ? (
            <div className="splan splan--gift">
              <div className="splan__h">
                <b className="splan__name">
                  <IconGift style={{ width: 16, height: 16, marginRight: 6, verticalAlign: "-2px" }} />
                  {ts("plans.gift.name")}
                </b>
              </div>
              <div className="splan__price">
                <b>{ts("plans.gift.price")}</b>
                <span>{ts("plans.gift.priceUnit")}</span>
              </div>
              <p className="splan__total">{ts("plans.gift.payNote")}</p>
              <ul className="splan__feats">
                {(ts.raw("plans.gift.features") as string[]).map((f, k) => (
                  <li key={k}>
                    <IconCheck />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/portal/client/gifts" className="btn btn--line btn--full">
                {ts("plans.gift.cta")}
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {personal ? <p className="plans__sub" style={{ marginTop: 12 }}>{ts("ratingInfo")}</p> : null}

      <div className="ppanel" style={{ marginTop: 22 }}>
        <div className="ppanel__h">
          <b>{t("billing.title")}</b>
        </div>
        {payments.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !bills.length ? (
          <EmptyState icon={<IconCard />} title={t("billing.empty")} text={t("billing.emptyText")} />
        ) : (
          <div className="alist">
            {bills.map((p) => (
              <div className="creq" key={p.id}>
                <span className="creq__st" />
                <div className="creq__m">
                  <b>{p.description || p.kind || "—"}</b>
                  <span>{fmtDate(p.createdAt)}</span>
                </div>
                <span className={`creq__badge${p.status === "paid" ? " creq__badge--ok" : ""}`}>
                  {som(p.amount)} {p.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
