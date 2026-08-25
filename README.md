# LexGo — corporate site

Multi-page corporate site for the LexGo legal-services platform (Uzbekistan),
built with **Next.js (App Router) + TypeScript** and **next-intl**. Ported from
the original single-page design in [`reference/index.html`](reference/index.html).

## Languages

Three locales with path-prefix routing: **`/uz`** (default), **`/ru`**, **`/en`**.

All UI text lives in one file per language — no strings are hard-coded in
components:

```
messages/uz.json
messages/ru.json
messages/en.json
```

`messages/en.json` is the source-of-truth schema; the three files are kept in
structural sync (same keys, same array lengths; only NLP keyword arrays differ
per language).

## Pages

`/` (home — the full landing) plus dedicated routes:
`ai`, `services`, `lawyers`, `subscription`, `business`, `for-lawyers`,
`warranty`, `app`, `faq`, `contact` — each available in all three locales.

## Structure

```
i18n/            routing, request config, navigation helpers (next-intl)
middleware.ts    locale negotiation / redirects
app/[locale]/    localized layout + one folder per page
components/       Navbar, Footer, MobileTabBar, AIChatDock, LanguageSwitcher …
components/sections/  one component per page section (reused on home + subpages)
components/chat/  LexGo.AI chat widget + classification hook
lib/             lawyers data, chat/finder logic, chat event bus
app/globals.css  design system ported verbatim from the original
```

## Develop

```bash
npm run dev     # http://localhost:3000  ->  redirects to /uz
npm run build
npm run start
```

## Notes

- The lawyer directory and the LexGo.AI finder/chat run fully client-side on
  mock data (`lib/lawyers.ts`). Wire them to a real API when available.
- Practice areas, regions and case stages are keyed enums resolved through the
  message files, so adding a locale = adding one `messages/<locale>.json` plus
  the locale code in `i18n/routing.ts`.
