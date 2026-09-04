export type Lawyer = {
  userId?: string; // backend user id (for purchase/chat), when from the API
  name: string;
  regionKey: string; // key into enums.regions
  areaKey: string; // key into enums.areas
  exp: number;
  rate: number;
  rev: number;
  full: number;
  part: number;
  price: string; // formatted number, currency word comes from translations
  super: boolean;
};

// Practice areas and regions used across the site (keys resolved via messages).
export const AREA_KEYS = [
  "criminal",
  "economic",
  "civil",
  "family",
  "labor",
  "administrative",
  "tax",
  "ip",
  "migration",
  "realEstate",
];

export const REGION_KEYS = [
  "tashkent",
  "samarkand",
  "fergana",
  "bukhara",
  "namangan",
  "andijan",
  "kashkadarya",
  "khorezm",
  "jizzakh",
  "navoi",
];

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
