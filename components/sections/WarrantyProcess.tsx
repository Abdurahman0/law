import { useTranslations } from "next-intl";

export default function WarrantyProcess() {
  const t = useTranslations("warranty");
  const steps = t.raw("process") as { title: string; text: string }[];

  return (
    <section className="sec dark">
      <div className="wrap">
        <div className="head">
          <h2 className="h2" style={{ color: "#fff" }}>
            {t("processTitle")}
          </h2>
        </div>
        <div className="tl">
          {steps.map((s, i) => (
            <div className="tl__i" key={i}>
              <div className="tl__n">{i + 1}</div>
              <div className="tl__c">
                <b>{s.title}</b>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
