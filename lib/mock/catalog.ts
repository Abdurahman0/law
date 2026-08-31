// Reference lists that are UI config (not backend records): the languages a
// professional can list, plus the practice-area / region key taxonomies.
// Service records themselves come from the backend (GET /services).

// Spoken languages a professional can list (register.languages.*).
export const LANGUAGE_KEYS = ["uz", "ru", "en", "kaa", "tr", "ar"] as const;
export type LanguageKey = (typeof LANGUAGE_KEYS)[number];

// Practice areas / regions reuse the existing enums taxonomy.
export { AREA_KEYS, REGION_KEYS } from "@/lib/lawyers";
