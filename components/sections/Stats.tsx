"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { fmtNumber } from "@/lib/lexai";

function Stat({ to, sfx, label }: { to: number; sfx: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(el);
          if (reduce) {
            el.textContent = fmtNumber(to) + sfx;
            return;
          }
          let t0: number | null = null;
          const step = (ts: number) => {
            if (t0 === null) t0 = ts;
            const p = Math.min((ts - t0) / 1100, 1);
            el.textContent =
              fmtNumber(Math.floor(to * (1 - Math.pow(1 - p, 3)))) + sfx;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, sfx]);
  return (
    <div className="stat">
      <b ref={ref}>0</b>
      <span>{label}</span>
    </div>
  );
}

export default function Stats() {
  const t = useTranslations("home.stats");
  return (
    <section className="sec tight">
      <div className="wrap">
        <div className="stats">
          <Stat to={1240} sfx="" label={t("lawyers")} />
          <Stat to={200} sfx="+" label={t("templates")} />
          <Stat to={60} sfx={t("responseSuffix")} label={t("response")} />
          <Stat to={14} sfx="" label={t("coverage")} />
        </div>
      </div>
    </section>
  );
}
