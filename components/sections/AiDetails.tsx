import { useTranslations } from "next-intl";
import { IconSparkle } from "../icons";

export default function AiDetails() {
  const t = useTranslations("aiPage");
  const caps = t.raw("capabilities") as { title: string; text: string }[];
  const sources = t.raw("sources") as string[];
  const examples = t.raw("examples") as { q: string; a: string }[];

  return (
    <>
      <section className="sec">
        <div className="wrap">
          <div className="head">
            <h2 className="h2">{t("capabilitiesTitle")}</h2>
          </div>
          <div className="grid">
            {caps.map((c, i) => (
              <article className="card" key={i}>
                <span className="card__i">
                  <IconSparkle />
                </span>
                <h3 className="h4">{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec tight" style={{ background: "var(--b50)" }}>
        <div className="wrap">
          <div className="split">
            <div>
              <span className="kick">{t("sourcesTitle")}</span>
              <h2 className="h2">{t("sourcesTitle")}</h2>
              <ul className="checks" style={{ marginTop: 18 }}>
                {sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="head" style={{ marginBottom: 18 }}>
                <h3 className="h3">{t("examplesTitle")}</h3>
              </div>
              <div className="faq">
                {examples.map((e, i) => (
                  <details key={i} open={i === 0}>
                    <summary>{e.q}</summary>
                    <p>{e.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
