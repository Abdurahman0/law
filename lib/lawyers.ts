export type Lawyer = {
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

// Names stay literal; region/area are keys resolved through the message files.
export const LAWYERS: Lawyer[] = [
  { name: "Sardor Abdullayev", regionKey: "tashkent", areaKey: "criminal", exp: 12, rate: 4.9, rev: 214, full: 38, part: 12, price: "4 200 000", super: true },
  { name: "Nodira Rahimova", regionKey: "tashkent", areaKey: "economic", exp: 9, rate: 4.8, rev: 167, full: 29, part: 9, price: "3 600 000", super: false },
  { name: "Jahongir Yo'ldoshev", regionKey: "samarkand", areaKey: "criminal", exp: 7, rate: 4.7, rev: 98, full: 21, part: 14, price: "2 700 000", super: false },
  { name: "Dilnoza Karimova", regionKey: "tashkent", areaKey: "family", exp: 5, rate: 4.9, rev: 143, full: 34, part: 6, price: "1 900 000", super: false },
  { name: "Bekzod Toshmatov", regionKey: "fergana", areaKey: "civil", exp: 11, rate: 4.6, rev: 76, full: 24, part: 11, price: "2 300 000", super: true },
  { name: "Malika Ergasheva", regionKey: "bukhara", areaKey: "labor", exp: 4, rate: 4.8, rev: 61, full: 18, part: 5, price: "1 450 000", super: false },
  { name: "Rustam Qodirov", regionKey: "tashkent", areaKey: "civil", exp: 15, rate: 4.9, rev: 302, full: 52, part: 17, price: "4 800 000", super: true },
  { name: "Shahnoza Aliyeva", regionKey: "namangan", areaKey: "economic", exp: 3, rate: 4.5, rev: 34, full: 11, part: 4, price: "1 250 000", super: false },
  { name: "Otabek Nazarov", regionKey: "samarkand", areaKey: "labor", exp: 8, rate: 4.7, rev: 89, full: 26, part: 8, price: "1 800 000", super: false },
  { name: "Aziza Yusupova", regionKey: "andijan", areaKey: "family", exp: 6, rate: 4.8, rev: 72, full: 20, part: 7, price: "1 700 000", super: false },
  { name: "Farrux Ismoilov", regionKey: "tashkent", areaKey: "tax", exp: 10, rate: 4.7, rev: 120, full: 31, part: 10, price: "3 900 000", super: true },
  { name: "Gulnora Sattorova", regionKey: "samarkand", areaKey: "civil", exp: 9, rate: 4.6, rev: 88, full: 23, part: 12, price: "2 100 000", super: false },
  { name: "Islom Rahmonov", regionKey: "bukhara", areaKey: "criminal", exp: 13, rate: 4.8, rev: 156, full: 40, part: 15, price: "3 200 000", super: true },
  { name: "Kamola Xolmatova", regionKey: "tashkent", areaKey: "ip", exp: 7, rate: 4.9, rev: 101, full: 27, part: 5, price: "2 900 000", super: false },
  { name: "Sherzod Umarov", regionKey: "namangan", areaKey: "labor", exp: 5, rate: 4.6, rev: 54, full: 16, part: 6, price: "1 350 000", super: false },
  { name: "Laziza Ibragimova", regionKey: "khorezm", areaKey: "family", exp: 8, rate: 4.7, rev: 77, full: 22, part: 8, price: "1 550 000", super: false },
  { name: "Doston Qurbonov", regionKey: "kashkadarya", areaKey: "administrative", exp: 6, rate: 4.5, rev: 48, full: 15, part: 9, price: "1 400 000", super: false },
  { name: "Nigora Tursunova", regionKey: "tashkent", areaKey: "economic", exp: 14, rate: 4.9, rev: 268, full: 49, part: 14, price: "4 600 000", super: true },
  { name: "Javlon Abduqodirov", regionKey: "jizzakh", areaKey: "migration", exp: 4, rate: 4.6, rev: 39, full: 12, part: 4, price: "1 200 000", super: false },
  { name: "Ozoda Yodgorova", regionKey: "navoi", areaKey: "realEstate", exp: 9, rate: 4.7, rev: 83, full: 25, part: 7, price: "2 000 000", super: false },
];

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
