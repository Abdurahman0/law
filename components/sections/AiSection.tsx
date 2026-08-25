import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ChatWidget from "../chat/ChatWidget";
import { IconInfo } from "../icons";

export default function AiSection() {
  const t = useTranslations("aiPage");
  const cta = useTranslations("cta");
  const features = t.raw("features") as string[];

  return (
    <section className="sec dark" id="ai">
      <div className="wrap">
        <div className="split">
          <div>
            <span className="kick">{t("kicker")}</span>
            <h2 className="h2" style={{ color: "#fff" }}>
              {t("title")}
            </h2>
            <p className="lead">{t("lead")}</p>
            <ul className="checks">
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <div className="info" style={{ marginTop: 26 }}>
              <IconInfo />
              <span>{t("info")}</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 26,
              }}
            >
              <Link href="/chat" className="btn btn--grad">
                {cta("tryFree")}
              </Link>
              <Link href="/subscription" className="btn btn--glass">
                {cta("subscriptionPrices")}
              </Link>
            </div>
          </div>

          <div className="phone">
            <div className="phone__s">
              <span className="phone__n" />
              <ChatWidget variant="phone" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
