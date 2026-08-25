"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const KEYS = [
  "preInvestigation",
  "investigation",
  "firstInstance",
  "appeal",
  "cassation",
];

export default function StagesSection() {
  const t = useTranslations("stages");
  const te = useTranslations("enums");
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setGo(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setGo(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec" id="bosqich">
      <div className="wrap">
        <div className="head">
          <span className="kick">{t("kicker")}</span>
          <h2 className="h2">{t("title")}</h2>
          <p className="lead">{t("lead")}</p>
        </div>
        <div className={`steps${go ? " go" : ""}`} ref={ref}>
          {KEYS.map((k) => (
            <div className="step hit" key={k}>
              <div className="step__l" />
              <div className="step__c">{te(`stages.${k}.code`)}</div>
              <b>{te(`stages.${k}.name`)}</b>
              <p>{te(`stages.${k}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
