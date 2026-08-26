// Handmade date formatting (no Intl): ISO "2026-08-22" -> "22 Avgust 2026".
const MONTHS: Record<string, string[]> = {
  uz: [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
  ],
  ru: [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

export function fmtDate(iso: string, locale: string): string {
  if (!iso) return "";
  const parts = iso.split("-").map((n) => parseInt(n, 10));
  const [y, m, d] = parts;
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  const months = MONTHS[locale] || MONTHS.uz;
  return `${d} ${months[m - 1]} ${y}`;
}

// Nominative month names (for headers like "Avgust 2026").
const MONTHS_NOM: Record<string, string[]> = {
  uz: MONTHS.uz,
  ru: [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ],
  en: MONTHS.en,
};

// Short weekday names, Monday-first.
const WEEKDAYS: Record<string, string[]> = {
  uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function monthTitle(year: number, month0: number, locale: string): string {
  const months = MONTHS_NOM[locale] || MONTHS_NOM.uz;
  return `${months[month0]} ${year}`;
}

export function weekdays(locale: string): string[] {
  return WEEKDAYS[locale] || WEEKDAYS.uz;
}
