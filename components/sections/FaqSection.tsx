"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState(0);

  return (
    <section className="sec" id="faq" style={{ background: "var(--b50)" }}>
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
        </div>
        <div className="faq">
          {items.map((it, i) => {
            const on = open === i;
            return (
              <div className={`faqi${on ? " open" : ""}`} key={i}>
                <button
                  className="faqi__q"
                  aria-expanded={on}
                  onClick={() => setOpen(on ? -1 : i)}
                >
                  {it.q}
                </button>
                <div className="faqi__p">
                  <div>
                    <p>{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
