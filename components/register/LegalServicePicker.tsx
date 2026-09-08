"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LEGAL_SERVICES, legalServiceLabel, type CatalogLocale } from "@/lib/legalServices";
import { IconSearch, IconChevronRight, IconCheck } from "../icons";

export default function LegalServicePicker({
  value,
  onChange,
  isAdvocate = true,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  isAdvocate?: boolean; // lawyers can't pick advocate-only categories
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

  // Whole-group toggle: if every service in the category is already picked,
  // clear them all; otherwise select the entire group at once.
  function toggleAll(keys: string[]) {
    const next = new Set(sel);
    const allOn = keys.length > 0 && keys.every((k) => next.has(k));
    if (allOn) keys.forEach((k) => next.delete(k));
    else keys.forEach((k) => next.add(k));
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
            const locked = !!cat.advocateOnly && !isAdvocate;
            const expanded = locked ? false : query ? true : open.has(cat.key);
            const allKeys = cat.services.map((s) => s.key);
            const chosen = allKeys.filter((k) => sel.has(k)).length;
            const allOn = chosen === allKeys.length && allKeys.length > 0;
            const someOn = chosen > 0 && !allOn;
            return (
              <div className={`lsp__cat${expanded ? " on" : ""}${locked ? " lsp__cat--locked" : ""}`} key={cat.key}>
                <div className="lsp__head">
                  {locked ? null : (
                    <button
                      type="button"
                      className={`lsp__box lsp__checkall${allOn ? " on" : ""}${someOn ? " some" : ""}`}
                      onClick={() => toggleAll(allKeys)}
                      role="checkbox"
                      aria-checked={allOn ? true : someOn ? "mixed" : false}
                      aria-label={t("selectAll")}
                    >
                      {allOn ? <IconCheck /> : someOn ? <span className="lsp__dash" /> : null}
                    </button>
                  )}
                  <button
                    type="button"
                    className="lsp__headmain"
                    onClick={() => !locked && toggleCat(cat.key)}
                    disabled={locked}
                  >
                    <span className="lsp__hlabel">{legalServiceLabel(cat.key, locale)}</span>
                    {cat.advocateOnly ? <span className="lsp__advonly">{t("advocateOnly")}</span> : null}
                    {chosen > 0 ? <span className="lsp__badge">{chosen}</span> : null}
                    {locked ? null : (
                      <span className="lsp__cv">
                        <IconChevronRight />
                      </span>
                    )}
                  </button>
                </div>
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
