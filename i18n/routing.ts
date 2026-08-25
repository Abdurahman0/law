import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Uzbek, Russian, English
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  // Always prefix the locale in the pathname: /uz, /ru, /en
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
