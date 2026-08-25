import { useTranslations } from "next-intl";
import {
  IconSparkle,
  IconUser,
  IconFileText,
  IconGrid,
  IconChat,
  IconCard,
} from "../icons";

const ICONS = [
  IconSparkle,
  IconUser,
  IconFileText,
  IconGrid,
  IconChat,
  IconCard,
];

export default function AppFeatures() {
  const t = useTranslations("appPage");
  const features = t.raw("features") as { title: string; text: string }[];

  return (
    <section className="sec" style={{ background: "var(--b50)" }}>
      <div className="wrap">
        <div className="head">
          <h2 className="h2">{t("featuresTitle")}</h2>
        </div>
        <div className="grid">
          {features.map((f, i) => {
            const I = ICONS[i] ?? IconSparkle;
            return (
              <article className="card" key={i}>
                <span className="card__i">
                  <I />
                </span>
                <h3 className="h4">{f.title}</h3>
                <p>{f.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
