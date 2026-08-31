"use client";

import { useState, type FormEvent } from "react";
import Select from "@/components/Select";

export function useReload(): [number, () => void] {
  const [k, setK] = useState(0);
  return [k, () => setK((x) => x + 1)];
}

export function Notice({ ok, msg }: { ok: boolean; msg: string }) {
  return <div className={`anote anote--${ok ? "ok" : "err"}`}>{msg}</div>;
}

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select";
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
      {fields.map((f) => (
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
      ))}
      {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
      <button className="btn btn--pri" type="submit" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </button>
    </form>
  );
}
