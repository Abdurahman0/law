"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Select from "@/components/Select";
import { listLawyers } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";

export function useReload(): [number, () => void] {
  const [k, setK] = useState(0);
  return [k, () => setK((x) => x + 1)];
}

export function Notice({ ok, msg }: { ok: boolean; msg: string }) {
  return <div className={`anote anote--${ok ? "ok" : "err"}`}>{msg}</div>;
}

// Clean list row for admin lists (no raw ids).
export function AdminItem({
  index,
  title,
  meta,
  tags,
  right,
}: {
  index?: number;
  title: string;
  meta?: string;
  tags?: { label: string; tone?: "ok" | "muted" }[];
  right?: ReactNode;
}) {
  return (
    <div className="aitem">
      {index != null ? <span className="aitem__n">{index}</span> : null}
      <div className="aitem__m">
        <b>{title}</b>
        {meta ? <span className="aitem__meta">{meta}</span> : null}
        {tags && tags.length ? (
          <div className="aitem__tags">
            {tags.map((t, i) => (
              <em key={i} className={`atag${t.tone ? ` atag--${t.tone}` : ""}`}>{t.label}</em>
            ))}
          </div>
        ) : null}
      </div>
      {right != null ? <div className="aitem__r">{right}</div> : null}
    </div>
  );
}

// Pick a professional by name + phone; the value is the user id, never shown.
export function UserSelect({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
}) {
  const res = useResource(listLawyers, []);
  const opts = res.data
    .filter((l) => l.userId)
    .map((l) => ({
      value: l.userId,
      label: `${l.name || "—"}${l.phone ? ` · ${l.phone}` : ""}`,
    }));
  return (
    <div>
      <label>{label}</label>
      <Select value={value} onChange={onChange} options={opts} ariaLabel={label} placeholder={placeholder} />
    </div>
  );
}

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "user";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
};

type Vals = Record<string, string | boolean>;

function initial(fields: Field[]): Vals {
  return Object.fromEntries(
    fields.map((f) => [f.name, f.type === "checkbox" ? true : ""]),
  );
}

export function AdminForm({
  fields,
  onSubmit,
  submitLabel,
  busyLabel,
  okMsg,
  errMsg,
  onDone,
}: {
  fields: Field[];
  onSubmit: (values: Vals) => Promise<void>;
  submitLabel: string;
  busyLabel: string;
  okMsg: string;
  errMsg: string;
  onDone?: () => void;
}) {
  const [vals, setVals] = useState<Vals>(() => initial(fields));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  function set(name: string, v: string | boolean) {
    setVals((s) => ({ ...s, [name]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    for (const f of fields) {
      if (f.required && f.type !== "checkbox" && !String(vals[f.name] ?? "").trim()) {
        setNote({ ok: false, msg: errMsg });
        return;
      }
    }
    setBusy(true);
    setNote(null);
    try {
      await onSubmit(vals);
      setNote({ ok: true, msg: okMsg });
      setVals(initial(fields));
      onDone?.();
    } catch (e) {
      const detail =
        e && typeof e === "object" && "detail" in e ? String((e as { detail?: string }).detail) : "";
      setNote({ ok: false, msg: detail || errMsg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="cform" style={{ maxWidth: "none" }} onSubmit={submit}>
      {fields.map((f) =>
        f.type === "user" ? (
          <UserSelect
            key={f.name}
            value={vals[f.name] as string}
            onChange={(v) => set(f.name, v)}
            label={f.label}
            placeholder={f.placeholder ?? ""}
          />
        ) : (
        <div key={f.name} className={f.type === "checkbox" ? "afield--check" : undefined}>
          {f.type === "checkbox" ? (
            <label className="wh__check">
              <input
                type="checkbox"
                checked={vals[f.name] as boolean}
                onChange={(e) => set(f.name, e.target.checked)}
              />
              {f.label}
            </label>
          ) : (
            <>
              <label>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={vals[f.name] as string}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                />
              ) : f.type === "select" ? (
                <Select
                  value={vals[f.name] as string}
                  onChange={(v) => set(f.name, v)}
                  options={f.options ?? []}
                  ariaLabel={f.label}
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={vals[f.name] as string}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </>
          )}
        </div>
        ),
      )}
      {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
      <button className="btn btn--pri" type="submit" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </button>
    </form>
  );
}
