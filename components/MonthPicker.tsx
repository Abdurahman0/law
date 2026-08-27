"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { monthNames, monthTitle } from "@/lib/date";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconClose } from "./icons";

type Parsed = { y: number; m: number };

function parse(value: string): Parsed | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const y = parseInt(value.slice(0, 4), 10);
  const m = parseInt(value.slice(5, 7), 10) - 1;
  if (m < 0 || m > 11) return null;
  return { y, m };
}

export default function MonthPicker({
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled,
  clearLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel?: string;
  disabled?: boolean;
  clearLabel?: string;
}) {
  const locale = useLocale();
  const months = monthNames(locale);
  const parsed = parse(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.y : new Date().getFullYear(),
  );
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parsed) setViewYear(parsed.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function pick(m: number) {
    onChange(`${viewYear}-${String(m + 1).padStart(2, "0")}`);
    setOpen(false);
  }

  const label = parsed ? monthTitle(parsed.y, parsed.m, locale) : placeholder;

  return (
    <div className="mpick" ref={root} data-open={open}>
      <button
        type="button"
        className={`mpick__btn${parsed ? "" : " mpick__btn--ph"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <IconCalendar />
        <span className="mpick__val">{label}</span>
        <span className="mpick__cv" />
      </button>
      {open ? (
        <div className="mpick__pop" role="dialog" aria-label={ariaLabel}>
          <div className="mpick__nav">
            <button type="button" aria-label="prev" onClick={() => setViewYear((y) => y - 1)}>
              <IconChevronLeft />
            </button>
            <b>{viewYear}</b>
            <button type="button" aria-label="next" onClick={() => setViewYear((y) => y + 1)}>
              <IconChevronRight />
            </button>
          </div>
          <div className="mpick__grid">
            {months.map((mn, i) => {
              const on = !!parsed && parsed.y === viewYear && parsed.m === i;
              return (
                <button
                  key={i}
                  type="button"
                  className={`mpick__m${on ? " on" : ""}`}
                  onClick={() => pick(i)}
                >
                  {mn.slice(0, 3)}
                </button>
              );
            })}
          </div>
          {value && clearLabel ? (
            <button
              type="button"
              className="mpick__clear"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <IconClose />
              {clearLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
