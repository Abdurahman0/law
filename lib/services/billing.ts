// Mock billing/payment service for subscriptions and promotion purchases.
import { mockDelay, jitter } from "./mockDelay";
import type { PlanTier } from "@/lib/types";

export type CheckoutResult =
  | { ok: true; invoiceId: string }
  | { ok: false; message: string };

function invoiceId(): string {
  return "INV-" + Math.floor(1000 + Math.random() * 9000);
}

export async function subscribe(tier: PlanTier): Promise<CheckoutResult> {
  await mockDelay(jitter(1400, 500));
  if (tier === "free") return { ok: true, invoiceId: "FREE" };
  return { ok: true, invoiceId: invoiceId() };
}

export async function buyPromotion(days: number): Promise<CheckoutResult> {
  await mockDelay(jitter(1400, 500));
  if (days <= 0) return { ok: false, message: "invalid_package" };
  return { ok: true, invoiceId: invoiceId() };
}
