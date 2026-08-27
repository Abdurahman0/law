"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SERVICE_CATALOG } from "@/lib/mock/catalog";
import type { ServiceKey } from "@/lib/types";
import { Icon, IconSearch, IconCheck } from "../icons";

export default function ServiceSelector({
  value,
  onChange,
}: {
  value: ServiceKey[];
  onChange: (next: ServiceKey[]) => void;
}) {
  const tc = useTranslations("catalog");
  const t = useTranslations("register.services");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return SERVICE_CATALOG;
    return SERVICE_CATALOG.filter(
      (s) =>
        tc(`${s.key}.name`).toLowerCase().includes(query) ||
        tc(`${s.key}.desc`).toLowerCase().includes(query),
    );
  }, [q, tc]);

  function toggle(k: ServiceKey) {
    onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  }

  return (
    <div className="svsel">
      <div className="svsel__bar">
        <span className="svsel__search">
          <IconSearch />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
          />
        </span>
        <span className="svsel__count">{t("selected", { n: value.length })}</span>
      </div>
      <div className="svsel__grid">
        {list.map((s) => {
          const on = value.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              className={`svcard${on ? " on" : ""}`}
              aria-pressed={on}
              onClick={() => toggle(s.key)}
            >
              <span className="svcard__i">
                <Icon name={s.icon} />
              </span>
              <span className="svcard__t">
                <b>{tc(`${s.key}.name`)}</b>
                <small>{tc(`${s.key}.desc`)}</small>
              </span>
              <span className="svcard__c">{on ? <IconCheck /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
