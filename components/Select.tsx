"use client";

import { useEffect, useRef, useState } from "react";

export type Option = { value: string; label: string };

export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  ariaLabel?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = options.find((o) => o.value === value) ?? (placeholder ? undefined : options[0]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      const idx = Math.max(
        0,
        options.findIndex((o) => o.value === value),
      );
      setActive(idx);
      requestAnimationFrame(() => optRefs.current[idx]?.focus());
    }
  }, [open, options, value]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    btn.current?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.min(active + 1, options.length - 1);
      setActive(n);
      optRefs.current[n]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.max(active - 1, 0);
      setActive(n);
      optRefs.current[n]?.focus();
    }
  }

  return (
    <div className="dsel" ref={root} data-open={open} onKeyDown={onKey}>
      <button
        ref={btn}
        type="button"
        className="dsel__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`dsel__val${selected ? "" : " dsel__val--ph"}`}>
          {selected?.label ?? placeholder}
        </span>
        <span className="dsel__cv" />
      </button>
      {open ? (
        <ul className="dsel__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                ref={(el) => {
                  optRefs.current[i] = el;
                }}
                type="button"
                className="dsel__opt"
                aria-selected={o.value === value}
                onClick={() => pick(o.value)}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
