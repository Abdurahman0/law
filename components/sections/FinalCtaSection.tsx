import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconSparkle, IconUser } from "../icons";

export default function FinalCtaSection() {
  const t = useTranslations("home.finalCta");
  return (
    <section className="sec">
      <div className="wrap">
        <div className="appcta finalcta">
          <div className="appcta__g">
            <div>
              <span
                className="kick"
                style={{ color: "var(--cy)", background: "rgba(0,207,232,.14)" }}
              >
                {t("kicker")}
              </span>
              <h2 className="h2" style={{ color: "#fff" }}>
                {t("title")}
              </h2>
              <p className="lead" style={{ color: "#B7CDEC" }}>
                {t("lead")}
              </p>
              <div className="stores">
                <Link href="/chat" className="btn btn--grad btn--lg">
                  <IconSparkle />
                  {t("primary")}
                </Link>
                <Link href="/lawyers" className="btn btn--glass btn--lg">
                  <IconUser />
                  {t("secondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
