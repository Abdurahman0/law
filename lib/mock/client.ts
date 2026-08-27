// Client-side dashboard mock data (requests, matched specialists, journey).
import type { ClientRequest, MatchedSpecialist } from "@/lib/types";

export const CLIENT_REQUESTS: ClientRequest[] = [
  {
    id: "RQ-5821",
    title: "Ish haqi 3 oydan beri to'lanmayapti",
    categoryKey: "employment",
    status: "inProgress",
    specialist: "Sardor Abdullayev",
    nextActionKey: "awaitLawyer",
    deadline: "2026-09-03",
    updatedAt: "2026-08-26",
    unread: 2,
  },
  {
    id: "RQ-5834",
    title: "Ijara shartnomasini tayyorlash",
    categoryKey: "contract",
    status: "consultation",
    specialist: "LexGo.AI",
    nextActionKey: "reviewDraft",
    deadline: "2026-08-29",
    updatedAt: "2026-08-25",
    unread: 0,
  },
  {
    id: "RQ-5840",
    title: "Kvartira oldi-sotdisi bo'yicha maslahat",
    categoryKey: "realEstate",
    status: "matching",
    nextActionKey: "chooseSpecialist",
    updatedAt: "2026-08-27",
    unread: 0,
  },
];

// "Best match" specialists LexGo surfaces for the client's active need.
export const MATCHED_SPECIALISTS: MatchedSpecialist[] = [
  {
    id: "SP-01",
    name: "Sardor Abdullayev",
    accountType: "advocate",
    areaKey: "labor",
    region: "tashkent",
    rating: 4.9,
    reviews: 128,
    matchPct: 96,
    verified: true,
    responseMin: 12,
  },
  {
    id: "SP-02",
    name: "Nodira Karimova",
    accountType: "lawyer",
    areaKey: "labor",
    region: "tashkent",
    rating: 4.8,
    reviews: 94,
    matchPct: 91,
    verified: true,
    responseMin: 25,
  },
  {
    id: "SP-03",
    name: "Rustam Qodirov",
    accountType: "advocate",
    areaKey: "civil",
    region: "samarkand",
    rating: 4.7,
    reviews: 76,
    matchPct: 84,
    verified: false,
    responseMin: 40,
  },
];

// The signature LexGo "legal journey" stages (client.journey.* labels).
export const JOURNEY_STAGES = [
  "problem",
  "analysis",
  "specialist",
  "consultation",
  "resolution",
] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number];

// Quick actions on the client hero (client.actions.* labels + href/icon).
export type QuickAction = { key: string; icon: string; href: string; primary?: boolean };
export const CLIENT_QUICK_ACTIONS: QuickAction[] = [
  { key: "describe", icon: "IconChatDots", href: "/portal/client/ai", primary: true },
  { key: "findSpecialist", icon: "IconSearch", href: "/portal/client/lawyers" },
  { key: "consultation", icon: "IconVideo", href: "/portal/client/lawyers" },
  { key: "track", icon: "IconClipboardCheck", href: "/portal/client/cases" },
  { key: "askAi", icon: "IconSparkle", href: "/portal/client/ai" },
  { key: "upload", icon: "IconDownload", href: "/portal/client/ai" },
];
