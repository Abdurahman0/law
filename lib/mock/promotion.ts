// Paid profile promotion — packages + mock visibility analytics.
import type { PromoPackage, PromoStats } from "@/lib/types";

export const PROMO_PACKAGES: PromoPackage[] = [
  { days: 7, price: 79000, reachMultiplier: 1.8 },
  { days: 14, price: 139000, reachMultiplier: 2.4, featured: true },
  { days: 30, price: 249000, reachMultiplier: 3.2 },
];

export const PROMO_STATS: PromoStats = {
  searchPosition: 18,
  visibilityPct: 42,
  impressions: 1240,
  searchAppearances: 860,
  profileClicks: 210,
  contactRequests: 24,
  estReachIncreasePct: 160,
};

// 14-day impression sparkline (relative values) for the promotion analytics.
export const PROMO_TREND = [12, 18, 16, 24, 22, 30, 28, 41, 38, 52, 60, 74, 88, 96];
