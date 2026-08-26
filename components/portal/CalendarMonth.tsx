"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { monthTitle, weekdays } from "@/lib/date";
import { CALENDAR, type CalendarEvent } from "@/lib/portalData";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

const TYPES = ["hearing", "investigative", "meeting", "deadline"] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CalendarMonth() {
  const t = useTranslations("portal.lawyer.calendar");
  const locale = useLocale();

  // Start on the month of the first event.
  const firstEv = CALENDAR[0]?.date || "2026-08-01";
  const [fy, fm] = firstEv.split("-").map(Number);
  const [year, setYear] = useState(fy || 2026);
  const [month0, setMonth0] = useState((fm || 1) - 1);

  const byDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of CALENDAR) (map[e.date] ||= []).push(e);
    return map;
  }, []);

  const firstDow = (new Date(year, month0, 1).getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prev() {
    if (month0 === 0) {
      setYear((y) => y - 1);
      setMonth0(11);
    } else setMonth0((m) => m - 1);
  }
  function next() {
    if (month0 === 11) {
      setYear((y) => y + 1);
      setMonth0(0);
    } else setMonth0((m) => m + 1);
  }
  function today() {
    setYear(now.getFullYear());
    setMonth0(now.getMonth());
  }

  const wd = weekdays(locale);

  return (
    <div className="gcal">
      <div className="gcal__top">
        <div className="gcal__title">{monthTitle(year, month0, locale)}</div>
        <div className="gcal__nav">
          <button type="button" onClick={prev} aria-label="prev">
            <IconChevronLeft />
          </button>
          <button type="button" onClick={next} aria-label="next">
            <IconChevronRight />
          </button>
        </div>
        <button type="button" className="gcal__today" onClick={today}>
          {t("today")}
        </button>
      </div>

      <div className="gcal__wd">
        {wd.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="gcal__grid">
        {cells.map((d, i) => {
          if (d === null)
            return <div key={i} className="gcal__cell gcal__cell--out" />;
          const ds = `${year}-${pad(month0 + 1)}-${pad(d)}`;
          const evs = byDate[ds] || [];
          return (
            <div key={i} className="gcal__cell">
              <span className={`gcal__dn${ds === todayStr ? " gcal__dn--today" : ""}`}>
                {d}
              </span>
              {evs.map((e, j) => (
                <div
                  key={j}
                  className={`gcal__ev gcal__ev--${e.typeKey}`}
                  title={`${e.time} · ${e.title}`}
                >
                  <b>{e.time}</b> {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="gcal__legend">
        {TYPES.map((k) => (
          <span key={k}>
            <i className={`gcal__dot gcal__dot--${k}`} />
            {t(k)}
          </span>
        ))}
      </div>
    </div>
  );
}
