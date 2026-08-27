// Legal service catalog + shared reference lists. Labels live in the messages
// (`catalog.*`, `register.languages.*`); this file holds only keys + iconography.
import type { ServiceCategory, ServiceKey } from "@/lib/types";

export const SERVICE_CATALOG: ServiceCategory[] = [
  { key: "consultation", icon: "IconChatDots" },
  { key: "contract", icon: "IconFileText" },
  { key: "business", icon: "IconBuilding" },
  { key: "document", icon: "IconDocLines" },
  { key: "family", icon: "IconUsers" },
  { key: "realEstate", icon: "IconHome" },
  { key: "tax", icon: "IconCard" },
  { key: "employment", icon: "IconBriefcase" },
  { key: "corporate", icon: "IconScale" },
  { key: "litigation", icon: "IconShield" },
  { key: "ip", icon: "IconSparkle" },
  { key: "migration", icon: "IconGlobe" },
  { key: "other", icon: "IconGrid" },
];

export const SERVICE_KEYS: ServiceKey[] = SERVICE_CATALOG.map((s) => s.key);

// Spoken languages a professional can list (register.languages.*).
export const LANGUAGE_KEYS = ["uz", "ru", "en", "kaa", "tr", "ar"] as const;
export type LanguageKey = (typeof LANGUAGE_KEYS)[number];

// Practice areas reuse the existing enums.areas taxonomy.
export { AREA_KEYS, REGION_KEYS } from "@/lib/lawyers";
