import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IconGrid,
  IconCard,
  IconBuilding,
  IconShield,
  IconFileText,
  IconChat,
} from "../icons";

const IND_ICONS = [
  IconGrid,
  IconCard,
  IconBuilding,
  IconShield,
  IconFileText,
  IconChat,
];

export default function BusinessSection() {
  const t = useTranslations("business");
  const cta = useTranslations("cta");
  const features = t.raw("features") as string[];
  const industries = t.raw("industries") as { title: string; text: string }[];
  const packages = t.raw("packages") as {
    name: string;
    for: string;
    price: string;
    priceUnit: string;
    features: string[];
  }[];
  const process = t.raw("process") as { title: string; text: string }[];

  return (
    <>
      <section className="sec" id="biznes">
        <div className="wrap">
          <div className="split">
            <div>
              <span className="kick">{t("kicker")}</span>
              <h2 className="h2">{t("title")}</h2>
              <p className="lead">{t("lead")}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
                <Link href="/contact" className="btn btn--pri">
                  {t("cta")}
                </Link>
                <Link href="/services" className="btn btn--line">
                  {cta("learnMore")}
                </Link>
              </div>
            </div>
            <ul className="checks">
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sec tight" style={{ background: "var(--b50)" }}>
        <div className="wrap">
          <div className="head">
            <h2 className="h2">{t("industriesTitle")}</h2>
          </div>
          <div className="mini">
            {industries.map((ind, i) => {
              const I = IND_ICONS[i] ?? IconGrid;
              return (
                <div className="mini__i" key={i}>
                  <span className="card__i">
                    <I />
                  </span>
                  <div>
                    <b>{ind.title}</b>
                    <p>{ind.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="head">
            <h2 className="h2">{t("packagesTitle")}</h2>
          </div>
          <div className="plans">
            {packages.map((p, i) => (
              <article className="plan" key={i}>
                <h3 className="plan__h">{p.name}</h3>
                <p className="plan__for">{p.for}</p>
                <div className="plan__p">
                  <b>{p.price}</b>
                  <em>{p.priceUnit}</em>
                </div>
                <ul>
                  {p.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`btn ${i === 1 ? "btn--grad" : "btn--line"} btn--full`}
                >
                  {cta("getStarted")}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec tight" style={{ background: "var(--b50)" }}>
        <div className="wrap">
          <div className="head">
            <h2 className="h2">{t("processTitle")}</h2>
          </div>
          <div className="tl">
            {process.map((s, i) => (
              <div className="tl__i" key={i}>
                <div className="tl__n">{i + 1}</div>
                <div className="tl__c">
                  <b>{s.title}</b>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
