"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LEGAL_SERVICES, legalServiceLabel, type CatalogLocale } from "@/lib/legalServices";
import { IconSearch, IconChevronRight, IconCheck } from "../icons";

export default function LegalServicePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const locale = useLocale() as CatalogLocale;
  const t = useTranslations("register.services");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const sel = useMemo(() => new Set(value), [value]);
  const query = q.trim().toLowerCase();

  function toggle(key: string) {
    const next = new Set(sel);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  }

  function toggleCat(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // When searching, only show categories/subservices that match, and expand them.
  const groups = LEGAL_SERVICES.map((cat) => {
    const catLabel = legalServiceLabel(cat.key, locale).toLowerCase();
    const catMatches = !query || catLabel.includes(query);
    const services = cat.services.filter(
      (s) => !query || catMatches || legalServiceLabel(s.key, locale).toLowerCase().includes(query),
    );
    return { cat, services };
  }).filter((g) => g.services.length > 0);

  return (
    <div className="lsp">
      <div className="lsp__search">
        <IconSearch />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
        />
      </div>

      {value.length ? <p className="lsp__count">{t("selected", { n: value.length })}</p> : null}

      <div className="lsp__cats">
        {groups.length === 0 ? (
          <div className="lsp__empty">{t("empty")}</div>
        ) : (
          groups.map(({ cat, services }) => {
            const expanded = query ? true : open.has(cat.key);
            const chosen = cat.services.filter((s) => sel.has(s.key)).length;
            return (
              <div className={`lsp__cat${expanded ? " on" : ""}`} key={cat.key}>
                <button type="button" className="lsp__head" onClick={() => toggleCat(cat.key)}>
                  <span className="lsp__hlabel">{legalServiceLabel(cat.key, locale)}</span>
                  {chosen > 0 ? <span className="lsp__badge">{chosen}</span> : null}
                  <span className="lsp__cv">
                    <IconChevronRight />
                  </span>
                </button>
                {expanded ? (
                  <div className="lsp__opts">
                    {services.map((s) => {
                      const on = sel.has(s.key);
                      return (
                        <button
                          type="button"
                          key={s.key}
                          className={`lsp__opt${on ? " on" : ""}`}
                          onClick={() => toggle(s.key)}
                          aria-pressed={on}
                        >
                          <span className="lsp__box">{on ? <IconCheck /> : null}</span>
                          {legalServiceLabel(s.key, locale)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
