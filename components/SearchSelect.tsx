"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconSearch, IconClose, IconCheck } from "./icons";

export type SearchOption = { value: string; label: string; sub?: string };

// Multi-select dropdown with a built-in search bar. Used to pick meeting
// participants; word-AND filter over label + sub.
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  ariaLabel,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: SearchOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.sub ?? ""}`.toLowerCase();
      return terms.every((w) => hay.includes(w));
    });
  }, [q, options]);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="ssel" ref={wrapRef}>
      <button type="button" className="ssel__ctrl" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}>
        {value.length ? (
          <span className="ssel__chips">
            {value.map((v) => (
              <span className="ssel__chip" key={v}>
                {byValue.get(v)?.label ?? v}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="remove"
                  onClick={(e) => { e.stopPropagation(); toggle(v); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggle(v); } }}
                >
                  <IconClose />
                </span>
              </span>
            ))}
          </span>
        ) : (
          <span className="ssel__ph">{placeholder}</span>
        )}
        <span className="ssel__cv" />
      </button>

      {open ? (
        <div className="ssel__menu" role="listbox" aria-label={ariaLabel}>
          <div className="ssel__search">
            <IconSearch />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} autoFocus />
          </div>
          <div className="ssel__list">
            {filtered.length === 0 ? (
              <p className="ssel__empty">{emptyText}</p>
            ) : (
              filtered.map((o) => {
                const on = value.includes(o.value);
                return (
                  <button type="button" key={o.value} className={`ssel__opt${on ? " on" : ""}`} role="option" aria-selected={on} onClick={() => toggle(o.value)}>
                    <span className="ssel__check">{on ? <IconCheck /> : null}</span>
                    <span className="ssel__ol">
                      <b>{o.label}</b>
                      {o.sub ? <span>{o.sub}</span> : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
