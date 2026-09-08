"use client";

import { useLocale } from "next-intl";
import { shortDate } from "@/lib/date";

// Lightweight responsive SVG line chart for time series (revenue trend etc.).
// X labels are localized dates ("31-avg", "31 авг", "Aug 31") — never raw ISO.
export default function LineChart({ points }: { points: { label: string; value: number }[] }) {
  const locale = useLocale();
  const pts = points.slice(-30);
  const short = (l: string) => shortDate(l, locale);
  if (pts.length < 2) {
    return <div className="lchart__empty">{pts.length ? `${short(pts[0].label)} · ${pts[0].value}` : ""}</div>;
  }
  const W = 600, H = 180, P = 6;
  const max = Math.max(...pts.map((p) => p.value), 1);
  const min = Math.min(...pts.map((p) => p.value), 0);
  const range = max - min || 1;
  const x = (i: number) => P + (i / (pts.length - 1)) * (W - 2 * P);
  const y = (v: number) => P + (1 - (v - min) / range) * (H - 2 * P);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)} ${(H - P).toFixed(1)} L${x(0).toFixed(1)} ${(H - P).toFixed(1)} Z`;
  const last = pts[pts.length - 1];
  const idxs = [0, Math.floor(pts.length / 3), Math.floor((2 * pts.length) / 3), pts.length - 1];

  return (
    <div className="lchart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="lchart__svg" aria-hidden>
        <defs>
          <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--b600)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--b600)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lcg)" />
        <path d={line} fill="none" stroke="var(--b600)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(pts.length - 1)} cy={y(last.value)} r="3.5" fill="var(--b600)" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="lchart__x">
        {idxs.map((i, k) => (
          <span key={k}>{short(pts[i].label)}</span>
        ))}
      </div>
    </div>
  );
}
