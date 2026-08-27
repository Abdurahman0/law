"use client";

import { IconCheck } from "../icons";

export type ChipOption = { value: string; label: string };

export default function ChipMulti({
  options,
  value,
  onChange,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }
  return (
    <div className="chipm">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            className={`chip${on ? " on" : ""}`}
            aria-pressed={on}
            onClick={() => toggle(o.value)}
          >
            {on ? <IconCheck /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
