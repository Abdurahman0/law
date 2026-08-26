import { useTranslations } from "next-intl";
import { initials } from "@/lib/lawyers";

export default function SocialProofSection() {
  const t = useTranslations("home.social");
  const ts = useTranslations("subscription");
  const items = ts.raw("testimonials") as {
    text: string;
    name: string;
    role: string;
  }[];
  return (
    <section className="sec">
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
        </div>
        <div className="quotes">
          {items.map((q, i) => (
            <div className="qcard" key={i}>
              <p>“{q.text}”</p>
              <div className="qcard__a">
                <span className="qcard__av">{initials(q.name)}</span>
                <div>
                  <b>{q.name}</b>
                  <span>{q.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
