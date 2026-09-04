"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getSubscriptionPlans, demoPlanPurchase, type BackendPlan } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { IconCheck, IconCard } from "@/components/icons";

function som(n: number): string {
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}

export default function PlansPanel() {
  const t = useTranslations("plans");
  const res = useResource<BackendPlan>(getSubscriptionPlans, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

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
      </div>

      {done ? <div className="plans__toast">{t("activated", { plan: done })}</div> : null}

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconCard />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="plans__grid">
          {res.data.map((plan, i) => (
            <div key={plan.id} className={`splan${i === 1 ? " splan--feat" : ""}`}>
              <div className="splan__h">
                <b className="splan__name">{plan.name}</b>
              </div>
              <div className="splan__price">
                {plan.price === 0 ? (
                  <b>{t("freeLabel")}</b>
                ) : (
                  <>
                    <b>{som(plan.price)}</b>
                    <span>{t("perMonth")}</span>
                  </>
                )}
              </div>
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
          ))}
        </div>
      )}

      <div className="ppanel" style={{ marginTop: 22 }}>
        <div className="ppanel__h">
          <b>{t("billing.title")}</b>
        </div>
        <EmptyState icon={<IconCard />} title={t("billing.empty")} text={t("billing.emptyText")} />
      </div>
    </div>
  );
}
