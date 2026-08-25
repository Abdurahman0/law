import { useTranslations } from "next-intl";
import {
  IconGrid,
  IconClock,
  IconSparkle,
  IconCard,
  IconShieldCheck,
  IconChat,
} from "../icons";

const TOOL_ICONS = [
  IconGrid,
  IconClock,
  IconSparkle,
  IconCard,
  IconShieldCheck,
  IconChat,
];

export default function ForLawyersExtras() {
  const t = useTranslations("forLawyers");
  const tools = t.raw("tools") as { title: string; text: string }[];
  const steps = t.raw("steps") as { title: string; text: string }[];
  const earnings = t.raw("earnings") as { value: string; label: string }[];

  return (
    <section className="sec">
      <div className="wrap">
        <div className="head">
          <h2 className="h2">{t("toolsTitle")}</h2>
        </div>
        <div className="mini">
          {tools.map((tool, i) => {
            const I = TOOL_ICONS[i] ?? IconSparkle;
            return (
              <div className="mini__i" key={i}>
                <span className="card__i">
                  <I />
                </span>
                <div>
                  <b>{tool.title}</b>
                  <p>{tool.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="strip">
          {earnings.map((e, i) => (
            <div className="strip__i" key={i}>
              <b>{e.value}</b>
              <span>{e.label}</span>
            </div>
          ))}
        </div>

        <div className="head" style={{ marginTop: 40 }}>
          <h2 className="h2">{t("stepsTitle")}</h2>
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
