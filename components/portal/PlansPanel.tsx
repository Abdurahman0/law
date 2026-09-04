"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getSubscriptionPlans,
  demoPlanPurchase,
  listPayments,
  type BackendPlan,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { IconCheck, IconCard } from "@/components/icons";

type Term = 1 | 6 | 12;

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

export default function PlansPanel() {
  const t = useTranslations("plans");
  const res = useResource<BackendPlan>(getSubscriptionPlans, []);
  const payments = useResource(listPayments, []);
  const [term, setTerm] = useState<Term>(6);
  const [upfront, setUpfront] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const bills = payments.data.filter((p) => !p.kind || p.kind === "subscription");

  async function choose(plan: BackendPlan) {
    if (busy) return;
    setBusy(plan.id);
    setDone(null);
    try {
      const r = await demoPlanPurchase(plan.id);
      if (r.paymentUrl) window.open(r.paymentUrl, "_blank");
      setDone(plan.name);
    } catch {
      /* ignore */
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
          <button type="button" aria-pressed={term === 1} onClick={() => setTerm(1)}>{t("term1")}</button>
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

      {done ? <div className="plans__toast">{t("activated", { plan: done })}</div> : null}

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconCard />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="plans__grid">
          {res.data.map((plan, i) => {
            const pr = pricing(plan, term, upfront);
            return (
              <div key={plan.id} className={`splan${i === 1 ? " splan--feat" : ""}`}>
                <div className="splan__h">
                  <b className="splan__name">{plan.name}</b>
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
                  {plan.features.map((f, k) => (
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
        </div>
      )}

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
