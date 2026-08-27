// Advocate business-dashboard mock data.
import type {
  AdvocateMetrics,
  AdvocateStats,
  Opportunity,
  ProfessionalProfile,
} from "@/lib/types";

export const ADVOCATE_METRICS: AdvocateMetrics = {
  profileViews: 1284,
  profileViewsDeltaPct: 18,
  contactRequests: 32,
  searchRank: 12,
  searchRankDelta: 4, // moved up 4 places
  rating: 4.9,
  reviews: 128,
  completeness: 78,
  responseRatePct: 94,
};

export const OPPORTUNITIES: Opportunity[] = [
  { id: "OP-3021", title: "Jinoiy ish bo'yicha himoya", areaKey: "criminal", region: "tashkent", budget: "3 500 000", postedAgoMin: 22, matchPct: 95 },
  { id: "OP-3018", title: "Xo'jalik nizosi — pretenziya", areaKey: "economic", region: "tashkent", budget: "2 200 000", postedAgoMin: 68, matchPct: 88 },
  { id: "OP-3009", title: "Ma'muriy protokolga e'tiroz", areaKey: "administrative", region: "samarkand", budget: "900 000", postedAgoMin: 140, matchPct: 81 },
];

export const ADVOCATE_DEFAULT_STATS: AdvocateStats = {
  totalCases: 240,
  casesWon: 198,
  successRate: 82,
  yearsPractice: 11,
  clientsRepresented: 320,
};

// 12-point profile-views trend for the dashboard sparkline.
export const VIEWS_TREND = [40, 48, 44, 60, 58, 72, 68, 84, 90, 102, 118, 140];

// A pre-filled sample advocate profile used to preview the profile page.
export const SAMPLE_ADVOCATE: ProfessionalProfile = {
  name: "Sardor Abdullayev",
  region: "tashkent",
  languages: ["uz", "ru", "en"],
  education: "Toshkent davlat yuridik universiteti",
  experienceYears: 11,
  bio: "Jinoiy va xo'jalik ishlari bo'yicha 11 yillik amaliyot. Sudlarda 240+ ish bo'yicha vakillik.",
  services: ["consultation", "litigation", "corporate"],
  email: "s.abdullayev@lexgo.uz",
  licenseNumber: "ADV-2015-4821",
  barAssociation: "O'zbekiston Advokatlar palatasi",
  specialization: "Jinoiy huquq",
  practiceAreas: ["criminal", "economic", "civil"],
  workHistory: [
    { id: "w1", org: "Toshkent shahar advokatura", position: "Advokat", start: "2015-03", end: null, current: true },
    { id: "w2", org: "Prokuratura organlari", position: "Yordamchi prokuror", start: "2012-01", end: "2015-02", current: false },
  ],
  stats: ADVOCATE_DEFAULT_STATS,
};
