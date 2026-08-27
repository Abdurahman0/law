// Subscription plans for legal professionals (lawyer + advocate).
// Feature copy lives at `plans.<tier>.features` in the messages.
import type { Invoice, Plan } from "@/lib/types";

export const PLANS: Plan[] = [
  { tier: "free", monthly: 0, featureCount: 3 },
  { tier: "pro", monthly: 149000, featured: true, featureCount: 5 },
  { tier: "premium", monthly: 349000, badge: true, featureCount: 6 },
];

export const CURRENT_PLAN_TIER = "free" as const;

export const INVOICES: Invoice[] = [
  { id: "INV-2048", planTier: "pro", date: "2026-07-01", amount: 149000, state: "paid" },
  { id: "INV-2071", planTier: "pro", date: "2026-08-01", amount: 149000, state: "paid" },
  { id: "INV-2090", planTier: "premium", date: "2026-08-15", amount: 349000, state: "pending" },
];
