import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconApple, IconGooglePlay, IconGraduation } from "../icons";

export default function AppCourseSection() {
  const t = useTranslations("appPage");
  const client = t.raw("client") as string[];
  const lawyer = t.raw("lawyer") as string[];
  const courses = t.raw("courses") as {
    kicker: string;
    title: string;
    text: string;
    cta: string;
  };

  return (
    <section className="sec" id="kurs">
      <div className="wrap">
        <div className="appcta" id="ilova">
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
              <div className="roles">
                <div className="role">
                  <b>{t("clientRole")}</b>
                  <ul>
                    {client.map((li, i) => (
                      <li key={i}>{li}</li>
                    ))}
                  </ul>
                </div>
                <div className="role">
                  <b>{t("lawyerRole")}</b>
                  <ul>
                    {lawyer.map((li, i) => (
                      <li key={i}>{li}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="stores">
                <a href="#" className="store">
                  <IconApple />
                  <span>
                    <u>{t("download")}</u>
                    <b>{t("appStore")}</b>
                  </span>
                </a>
                <a href="#" className="store">
                  <IconGooglePlay />
                  <span>
                    <u>{t("download")}</u>
                    <b>{t("googlePlay")}</b>
                  </span>
                </a>
              </div>
            </div>

            <div>
              <div className="wcard" style={{ background: "rgba(255,255,255,.08)" }}>
                <span className="wcard__i">
                  <IconGraduation />
                </span>
                <b>{courses.title}</b>
                <p>{courses.text}</p>
                <Link
                  href="/contact"
                  className="btn btn--grad btn--sm"
                  style={{ marginTop: 16 }}
                >
                  {courses.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
