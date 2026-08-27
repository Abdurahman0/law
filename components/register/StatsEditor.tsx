"use client";

import { useTranslations } from "next-intl";
import type { AdvocateStats } from "@/lib/types";
import { IconFileText, IconAward, IconTarget, IconClock, IconUsers } from "../icons";

const FIELDS: { key: keyof AdvocateStats; icon: typeof IconFileText; editable: boolean }[] = [
  { key: "totalCases", icon: IconFileText, editable: true },
  { key: "casesWon", icon: IconAward, editable: true },
  { key: "successRate", icon: IconTarget, editable: false },
  { key: "yearsPractice", icon: IconClock, editable: true },
  { key: "clientsRepresented", icon: IconUsers, editable: true },
];

export function computeStats(s: AdvocateStats): AdvocateStats {
  const successRate = s.totalCases > 0 ? Math.round((s.casesWon / s.totalCases) * 100) : 0;
  return { ...s, successRate: Math.min(successRate, 100) };
}

export default function StatsEditor({
  value,
  onChange,
}: {
  value: AdvocateStats;
  onChange: (next: AdvocateStats) => void;
}) {
  const t = useTranslations("register.advocate.stats");

  function set(key: keyof AdvocateStats, raw: string) {
    const n = Math.max(0, parseInt(raw || "0", 10) || 0);
    onChange(computeStats({ ...value, [key]: n }));
  }

  return (
    <div className="stged">
      {FIELDS.map(({ key, icon: I, editable }) => (
        <div className={`stged__c${editable ? "" : " stged__c--calc"}`} key={key}>
          <span className="stged__i">
            <I />
          </span>
          {editable ? (
            <input
              type="number"
              min={0}
              value={value[key] || ""}
              onChange={(e) => set(key, e.target.value)}
              placeholder="0"
            />
          ) : (
            <b className="stged__v">
              {value[key]}
              {key === "successRate" ? "%" : ""}
            </b>
          )}
          <span className="stged__l">{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
