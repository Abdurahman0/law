"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { listMyTasks, updateTaskStatus, createTask, type WorkTask } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { useReload, Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { Skeleton, EmptyState } from "./DataState";
import { IconClipboardCheck, IconChevronLeft, IconChevronRight, IconPlus } from "@/components/icons";

const STAGES = ["todo", "doing", "done"] as const;
type Stage = (typeof STAGES)[number];
const LEGACY: Record<string, Stage> = {
  todo: "todo", new: "todo", open: "todo", pending: "todo",
  doing: "doing", in_progress: "doing", active: "doing",
  done: "done", completed: "done", closed: "done",
};
const stageOf = (s: string): Stage => LEGACY[(s || "").toLowerCase()] ?? "todo";

export default function TaskBoard() {
  const t = useTranslations("portal.tasks");
  const [key, reload] = useReload();
  const res = useResource(() => listMyTasks(), [key]);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [prio, setPrio] = useState("medium");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !title.trim()) return;
    setSaving(true);
    setNote(null);
    try {
      await createTask({ title: title.trim(), priority: prio, due_date: due || undefined });
      setNote({ ok: true, msg: t("created") });
      setTitle("");
      setDue("");
      reload();
      setTimeout(() => setOpen(false), 800);
    } catch {
      setNote({ ok: false, msg: t("errorCreate") });
    } finally {
      setSaving(false);
    }
  }

  const cols = useMemo(() => {
    const by: Record<Stage, WorkTask[]> = { todo: [], doing: [], done: [] };
    for (const x of res.data) by[stageOf(x.status)].push(x);
    return by;
  }, [res.data]);

  async function move(x: WorkTask, dir: number) {
    const i = STAGES.indexOf(stageOf(x.status));
    const next = STAGES[Math.min(STAGES.length - 1, Math.max(0, i + dir))];
    if (next === STAGES[i]) return;
    setBusy(x.id);
    try {
      await updateTaskStatus(x.id, next);
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="ahdr">
          <span className="advmuted">{res.data.length}</span>
          <button className="btn btn--pri btn--sm" type="button" onClick={() => setOpen(true)}><IconPlus />{t("add")}</button>
        </span>
      </div>
      <p className="ppanel__note">{t("lead")}</p>

      <Modal open={open} onClose={() => setOpen(false)} title={t("add")}>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={addTask}>
          <div>
            <label>{t("taskTitle")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("taskTitlePh")} />
          </div>
          <div className="cform__row2">
            <div>
              <label>{t("priorityLabel")}</label>
              <Select value={prio} onChange={setPrio} options={["low", "medium", "high"].map((p) => ({ value: p, label: t(`priority.${p}`) }))} ariaLabel={t("priorityLabel")} />
            </div>
            <div>
              <label>{t("due")}</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={saving}>{saving ? t("saving") : t("save")}</button>
        </form>
      </Modal>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconClipboardCheck />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="pipe">
          {STAGES.map((s, si) => (
            <div className={`pipe__col pipe__col--${s === "todo" ? "new" : s === "doing" ? "contacted" : "won"}`} key={s}>
              <div className="pipe__head">
                <span className="pipe__dot" />
                <b>{t(`stages.${s}`)}</b>
                <span className="pipe__count">{cols[s].length}</span>
              </div>
              <div className="pipe__cards">
                {cols[s].length === 0 ? (
                  <div className="pipe__empty">{t("noneHere")}</div>
                ) : (
                  cols[s].map((x) => (
                    <div className="pipe__card" key={x.id}>
                      <div className="pipe__ctop">
                        <b>{x.title || "—"}</b>
                        <span className={`tprio tprio--${x.priority}`}>{t.has(`priority.${x.priority}`) ? t(`priority.${x.priority}`) : x.priority}</span>
                      </div>
                      {x.caseTitle ? <span className="pipe__meta">{x.caseTitle}</span> : null}
                      {x.dueDate ? <span className="pipe__meta">{t("due")}: {x.dueDate}</span> : null}
                      <div className="pipe__actions">
                        <button className="pipe__mv" disabled={si === 0 || busy === x.id} onClick={() => move(x, -1)} aria-label={t("back")}><IconChevronLeft /></button>
                        <span className="pipe__src" />
                        <button className="pipe__mv" disabled={si === STAGES.length - 1 || busy === x.id} onClick={() => move(x, 1)} aria-label={t("fwd")}><IconChevronRight /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
