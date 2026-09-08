"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { shortDate, fmtDate } from "@/lib/date";

// Responsive SVG line chart for time series (revenue trend etc.) with a
// date-range selector and hover tooltips. X labels are localized dates.
const RANGES = [
  { key: "d7", n: 7 },
  { key: "d30", n: 30 },
  { key: "d90", n: 90 },
  { key: "all", n: 0 },
];

export default function LineChart({
  points,
  format,
}: {
  points: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const locale = useLocale();
  const t = useTranslations("chart");
  const fmtV = format ?? ((n: number) => String(n));
  const [range, setRange] = useState(3); // default: all
  const [hover, setHover] = useState<number | null>(null);

  const n = RANGES[range].n;
  const pts = (n > 0 ? points.slice(-n) : points).slice(-120);

  const W = 600, H = 180, P = 6;
  const max = Math.max(...pts.map((p) => p.value), 1);
  const min = Math.min(...pts.map((p) => p.value), 0);
  const rng = max - min || 1;
  const xv = (i: number) => (pts.length < 2 ? W / 2 : P + (i / (pts.length - 1)) * (W - 2 * P));
  const yv = (v: number) => P + (1 - (v - min) / rng) * (H - 2 * P);
  const xp = (i: number) => (xv(i) / W) * 100;
  const yp = (v: number) => (yv(v) / H) * 100;

  const line = pts.map((p, i) => `${i ? "L" : "M"}${xv(i).toFixed(1)} ${yv(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${xv(pts.length - 1).toFixed(1)} ${(H - P).toFixed(1)} L${xv(0).toFixed(1)} ${(H - P).toFixed(1)} Z`;
  const idxs = pts.length > 1 ? [0, Math.floor(pts.length / 3), Math.floor((2 * pts.length) / 3), pts.length - 1] : [0];

  return (
    <div className="lchart">
      <div className="lchart__ranges">
        {RANGES.map((r, i) => (
          <button
            key={r.key}
            type="button"
            className={`lchart__range${i === range ? " on" : ""}`}
            onClick={() => { setRange(i); setHover(null); }}
          >
            {t(r.key)}
          </button>
        ))}
      </div>

      {pts.length < 2 ? (
        <div className="lchart__empty">{pts.length ? `${shortDate(pts[0].label, locale)} · ${fmtV(pts[0].value)}` : "—"}</div>
      ) : (
        <>
          <div className="lchart__plot">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="lchart__svg" aria-hidden>
              <defs>
                <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--b600)" stopOpacity="0.22" />
                  <stop offset="1" stopColor="var(--b600)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#lcg)" />
              <path d={line} fill="none" stroke="var(--b600)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>

            {hover != null && pts[hover] ? (
              <>
                <span className="lchart__guide" style={{ left: `${xp(hover)}%` }} />
                <span className="lchart__dot" style={{ left: `${xp(hover)}%`, top: `${yp(pts[hover].value)}%` }} />
                <div
                  className="lchart__tip"
                  style={{ left: `${Math.min(88, Math.max(12, xp(hover)))}%`, top: `${yp(pts[hover].value)}%` }}
                >
                  <b>{fmtV(pts[hover].value)}</b>
                  <span>{fmtDate(pts[hover].label, locale)}</span>
                </div>
              </>
            ) : null}

            <div className="lchart__hit" onMouseLeave={() => setHover(null)}>
              {pts.map((p, i) => (
                <span key={i} onMouseEnter={() => setHover(i)} aria-label={`${fmtDate(p.label, locale)}: ${fmtV(p.value)}`} />
              ))}
            </div>
          </div>

          <div className="lchart__x">
            {idxs.map((i, k) => (
              <span key={k}>{shortDate(pts[i].label, locale)}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
