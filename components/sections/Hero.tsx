import { useTranslations } from "next-intl";
import Finder from "./Finder";

export default function Hero() {
  const t = useTranslations("home.hero");
  const tags = t.raw("tags") as string[];
  return (
    <section className="hero" id="finder">
      <span className="hero__bg" />
      <span className="hero__mesh" />
      <div className="wrap">
        <div className="hero__in">
          <h1 className="hx">
            {t("titleLead")} <span>{t("titleAccent")}</span>
          </h1>
          <p>{t("subtitle")}</p>
          <div className="hero__tags">
            {tags.map((x, i) => (
              <span key={i} className="pill pill--glass">
                {x}
              </span>
            ))}
          </div>
        </div>
        <Finder />
      </div>
    </section>
  );
}
