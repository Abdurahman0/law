import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconSparkle, IconUser } from "../icons";
import Finder from "./Finder";

export default function Hero() {
  const t = useTranslations("home.hero");
  const cta = useTranslations("home.funnelCta");
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
          <div className="hero__cta">
            <Link href="/chat" className="btn btn--grad btn--lg">
              <IconSparkle />
              {cta("primary")}
            </Link>
            <Link href="/lawyers" className="btn btn--glass btn--lg">
              <IconUser />
              {cta("secondary")}
            </Link>
          </div>
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
