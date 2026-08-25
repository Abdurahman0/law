// Pure, locale-agnostic classification logic for the finder + AI chat.
// All display text and matching keywords are injected from the message files,
// so nothing user-facing lives here.

export const RULE_KEYS = [
  "criminal",
  "administrative",
  "labor",
  "civil",
  "economic",
  "corporate",
] as const;

export type RuleKey = (typeof RULE_KEYS)[number] | "general";

export const STAGE_KEYS = [
  "preInvestigation",
  "investigation",
  "firstInstance",
  "appeal",
  "cassation",
] as const;

export type StageKey = (typeof STAGE_KEYS)[number] | "unknown";

// Which lawyer practice-area each rule maps to, and the default case stage.
export const RULE_META: Record<
  Exclude<RuleKey, never>,
  { area: string | null; stage: StageKey }
> = {
  criminal: { area: "criminal", stage: "investigation" },
  administrative: { area: "civil", stage: "unknown" },
  labor: { area: "labor", stage: "unknown" },
  civil: { area: "civil", stage: "unknown" },
  economic: { area: "economic", stage: "unknown" },
  corporate: { area: "economic", stage: "unknown" },
  general: { area: null, stage: "unknown" },
};

export type Keywords = {
  criminal: string[];
  administrative: string[];
  labor: string[];
  civil: string[];
  economic: string[];
  corporate: string[];
  stages: Record<Exclude<StageKey, "unknown">, string[]>;
};

// Lowercase, strip apostrophes/quotes, collapse whitespace. No transliteration:
// keywords are provided in the active locale's own script.
export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[‘’ʻʼ'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function classify(
  text: string,
  keywords: Keywords,
): { ruleKey: RuleKey; stageKey: StageKey } {
  const t = normalize(text);
  let best: RuleKey = "general";
  let score = 0;

  for (const key of RULE_KEYS) {
    const list = keywords[key] || [];
    let s = 0;
    for (const kw of list) {
      if (kw && t.indexOf(normalize(kw)) > -1) s++;
    }
    if (s > score) {
      score = s;
      best = key;
    }
  }

  let stage: StageKey = RULE_META[best].stage;
  (Object.keys(keywords.stages) as Array<keyof Keywords["stages"]>).forEach(
    (sk) => {
      keywords.stages[sk].forEach((kw) => {
        if (kw && t.indexOf(normalize(kw)) > -1) stage = sk;
      });
    },
  );

  return { ruleKey: best, stageKey: stage };
}

// Multilingual intent triggers (matching logic, not display copy).
const GREET =
  /(salom|assalom|hayrli|hello|\bhi\b|\bhey\b|privet|zdravstvu|dobr)/i;
const THANKS = /(rahmat|tashakkur|raxmat|thank|spasibo|blagodar)/i;
const SUB = /(obuna|tarif|premium|standart|subscription|\bplan\b|podpisk|тариф|подписк)/i;
const PRICE =
  /(narx|qancha|pul|tolov|price|cost|how much|скольк|цена|стоим|оплат)/i;

export type Intent =
  | "greeting"
  | "thanks"
  | "subscription"
  | "price"
  | "classify";

export function detectIntent(text: string): Intent {
  const t = normalize(text);
  if (GREET.test(t)) return "greeting";
  if (THANKS.test(t)) return "thanks";
  if (SUB.test(t)) return "subscription";
  if (PRICE.test(t)) return "price";
  return "classify";
}

export function fmtNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
