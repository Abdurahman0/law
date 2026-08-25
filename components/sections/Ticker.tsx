"use client";

import { useTranslations } from "next-intl";

export default function Ticker() {
  const t = useTranslations("home");
  const items = t.raw("ticker") as { city: string; text: string }[];
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__t">
        {row.map((x, i) => (
          <span key={i} className="ticker__i">
            <i />
            <b>{x.city}</b> · {x.text}
          </span>
        ))}
      </div>
    </div>
  );
}
