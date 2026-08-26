import { useTranslations } from "next-intl";
import { IconAlert } from "../icons";

export default function ProblemSection() {
  const t = useTranslations("home.problem");
  const items = t.raw("items") as { title: string; text: string }[];
  return (
    <section className="sec">
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
          <p className="lead">{t("lead")}</p>
        </div>
        <div className="grid">
          {items.map((it, i) => (
            <article className="card card--warn" key={i}>
              <span className="card__i">
                <IconAlert />
              </span>
              <h3 className="h4">{it.title}</h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
