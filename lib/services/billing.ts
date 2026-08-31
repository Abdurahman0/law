// Billing/payment service. Attempts the real POST /payments intent and falls
// back to a mock success so the flow stays demoable before the backend is live.
import { mockDelay, jitter } from "./mockDelay";
import { createPayment } from "./backend";
import { PLANS } from "@/lib/mock/plans";
import { PROMO_PACKAGES } from "@/lib/mock/promotion";
import type { PlanTier } from "@/lib/types";

export type CheckoutResult =
  | { ok: true; invoiceId: string }
  | { ok: false; message: string };

function invoiceId(): string {
  return "INV-" + Math.floor(1000 + Math.random() * 9000);
}

async function pay(amount: number): Promise<CheckoutResult> {
  try {
    const r = await createPayment({ provider: "payme", amount });
    return { ok: true, invoiceId: r.id || invoiceId() };
  } catch {
    await mockDelay(jitter(1200, 500));
    return { ok: true, invoiceId: invoiceId() };
  }
}

export async function subscribe(tier: PlanTier): Promise<CheckoutResult> {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan || plan.monthly === 0) return { ok: true, invoiceId: "FREE" };
  return pay(plan.monthly);
}

export async function buyPromotion(days: number): Promise<CheckoutResult> {
  const pk = PROMO_PACKAGES.find((p) => p.days === days);
  if (!pk) return { ok: false, message: "invalid_package" };
  return pay(pk.price);
}
