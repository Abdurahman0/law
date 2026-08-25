import { useTranslations } from "next-intl";

export default function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];

  return (
    <section className="sec" id="faq" style={{ background: "var(--b50)" }}>
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
        </div>
        <div className="faq">
          {items.map((it, i) => (
            <details key={i} open={i === 0}>
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
