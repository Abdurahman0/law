import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ForLawyersSection() {
  const t = useTranslations("forLawyers");
  const features = t.raw("features") as string[];
  const d = t.raw("dash") as {
    today: string;
    badge: string;
    kpi: Record<string, string>;
    caseId: string;
    active: string;
    caseText: string;
    tags: string[];
    accept: string;
    requestInfo: string;
  };

  const kpis: { v: string; k: string; cy?: boolean }[] = [
    { v: "2", k: "urgent" },
    { v: "3", k: "hearings" },
    { v: "4", k: "deadlines" },
    { v: "5", k: "messages" },
    { v: "3", k: "toReview" },
    { v: "18,4 mln", k: "income", cy: true },
  ];

  return (
    <section className="sec dark" id="advokatga" style={{ background: "var(--b900)" }}>
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
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 26,
              }}
            >
              <Link href="/contact" className="btn btn--grad">
                {t("register")}
              </Link>
              <Link href="/app" className="btn btn--glass">
                {t("courses")}
              </Link>
            </div>
          </div>

          <div className="dash">
            <div className="dash__h">
              <b>{d.today}</b>
              <span className="pill pill--glass">{d.badge}</span>
            </div>
            <div className="kpis">
              {kpis.map((it) => (
                <div className="kpi" key={it.k}>
                  <b className={it.cy ? "cy" : undefined}>{it.v}</b>
                  <span>{d.kpi[it.k]}</span>
                </div>
              ))}
            </div>
            <div className="casec">
              <div className="casec__h">
                <span className="casec__id">{d.caseId}</span>
                <span className="pill pill--ok">{d.active}</span>
              </div>
              <p>{d.caseText}</p>
              <div className="casec__tags">
                {d.tags.map((tag, i) => (
                  <span className="pill pill--gray" key={i}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="casec__act">
                <button className="btn btn--pri btn--sm" type="button">
                  {d.accept}
                </button>
                <button className="btn btn--line btn--sm" type="button">
                  {d.requestInfo}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
