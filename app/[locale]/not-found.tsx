import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="sec" style={{ textAlign: "center" }}>
      <div className="wrap">
        <h1
          className="hx"
          style={{ fontSize: "clamp(3rem,10vw,6rem)", color: "var(--b600)" }}
        >
          404
        </h1>
        <h2 className="h2" style={{ marginTop: 16 }}>
          {t("title")}
        </h2>
        <p className="lead" style={{ margin: "12px auto 24px" }}>
          {t("text")}
        </p>
        <Link href="/" className="btn btn--pri">
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
