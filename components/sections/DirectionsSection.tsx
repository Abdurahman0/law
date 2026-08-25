import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconShield, IconScale, IconBuilding } from "../icons";

const ICONS = [IconShield, IconScale, IconBuilding];
const LINKS = ["/lawyers?area=criminal", "/lawyers?area=civil", "/business"];

export default function DirectionsSection() {
  const t = useTranslations("directions");
  const cta = useTranslations("cta");
  const cards = t.raw("cards") as { title: string; text: string }[];

  return (
    <section className="sec" id="yonalish">
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
          <p className="lead">{t("lead")}</p>
        </div>
        <div className="grid">
          {cards.map((c, i) => {
            const I = ICONS[i] ?? IconShield;
            return (
              <article className="card" key={i}>
                <span className="card__i">
                  <I />
                </span>
                <h3 className="h4">{c.title}</h3>
                <p>{c.text}</p>
                <div className="card__p">
                  <Link href={LINKS[i]} className="btn btn--soft btn--sm">
                    {i === 2 ? cta("requestOffer") : cta("viewPackages")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
