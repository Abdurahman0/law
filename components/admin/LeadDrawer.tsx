"use client";

import { useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLeadTimeline, reengageLead, logCcCall, createTask, type KanbanColumn, type Lead } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Notice, useReload } from "@/components/admin/AdminBits";
import DatePicker from "@/components/DatePicker";
import { fmtDate } from "@/lib/date";
import { Skeleton } from "@/components/portal/DataState";
import { IconClose, IconClock, IconPhone, IconSend } from "@/components/icons";

// Lead detail drawer for the sales workspace: client info, stage switch and a
// timeline of everything that happened to the lead.
export default function LeadDrawer({
  lead,
  colKey,
  columns,
  busy,
  onMove,
  onDelete,
  onClose,
}: {
  lead: Lead;
  colKey: string;
  columns: KanbanColumn[];
  busy: boolean;
  onMove: (columnKey: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("admin.pipeline");
  const locale = useLocale();
  const [tlKey, bumpTl] = useReload();
  const tl = useResource(() => getLeadTimeline(lead.id), [lead.id, tlKey]);
  const [note, setNote] = useState("");
  const [remind, setRemind] = useState("");
  const [act, setAct] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  async function addNote() {
    if (!note.trim() || act) return;
    setAct("note"); setMsg(null);
    try { await reengageLead(lead.id, note.trim()); setNote(""); setMsg({ ok: true, msg: t("d.done") }); bumpTl(); }
    catch { setMsg({ ok: false, msg: t("d.err") }); }
    finally { setAct(null); }
  }
  async function logCall() {
    if (act || !lead.phone) return;
    setAct("call"); setMsg(null);
    try { await logCcCall({ phone: lead.phone, note: `Lead: ${lead.name || lead.phone}` }); setMsg({ ok: true, msg: t("d.callLogged") }); bumpTl(); }
    catch { setMsg({ ok: false, msg: t("d.err") }); }
    finally { setAct(null); }
  }
  async function setReminder() {
    if (!remind || act) return;
    setAct("rem"); setMsg(null);
    try { await createTask({ title: `${t("d.reminderTitle")}: ${lead.name || lead.phone}`, priority: "medium", due_date: remind }); setRemind(""); setMsg({ ok: true, msg: t("d.reminderSet") }); }
    catch { setMsg({ ok: false, msg: t("d.err") }); }
    finally { setAct(null); }
  }

  const info: [string, string][] = [
    [t("d.phone"), lead.phone],
    [t("d.category"), lead.category && (t.has(`d.cat.${lead.category}`) ? t(`d.cat.${lead.category}`) : lead.category)],
    [t("d.region"), lead.region],
    [t("d.source"), lead.source && (t.has(`source.${lead.source}`) ? t(`source.${lead.source}`) : lead.source)],
    [t("d.urgency"), lead.urgency],
    [t("d.score"), lead.score ? String(lead.score) : ""],
    [t("d.created"), lead.createdAt ? fmtDate(lead.createdAt.slice(0, 10), locale) : ""],
  ];

  return (
    <>
      <div className="ldrw__scrim" onClick={onClose} />
      <aside className="ldrw" role="dialog" aria-label={lead.name || lead.phone}>
        <div className="ldrw__head">
          <div>
            <b className="ldrw__name">{lead.name || lead.phone || "—"}</b>
            {lead.phone ? <a className="ldrw__tel" href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}>{lead.phone}</a> : null}
          </div>
          <button className="ldrw__x" type="button" onClick={onClose} aria-label={t("d.close")}><IconClose /></button>
        </div>

        <div className="ldrw__body">
          {/* Stage switcher */}
          <div className="ldrw__sec">
            <span className="ldrw__lbl">{t("d.stage")}</span>
            <div className="ldrw__stages">
              {columns.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`ldrw__stage${c.key === colKey ? " on" : ""}`}
                  style={c.color ? ({ "--c": c.color } as CSSProperties) : undefined}
                  disabled={busy || c.key === colKey}
                  onClick={() => onMove(c.key)}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Client info */}
          <div className="ldrw__sec">
            <span className="ldrw__lbl">{t("d.info")}</span>
            <div className="ldrw__kv">
              {info.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><span>{k}</span><b>{v}</b></div>
              ))}
            </div>
            {lead.note ? <p className="ldrw__note">{lead.note}</p> : null}
          </div>

          {/* Quick actions */}
          <div className="ldrw__sec">
            <span className="ldrw__lbl">{t("d.actions")}</span>
            <div className="ldrw__acts">
              <a className="btn btn--soft btn--sm" href={`tel:${(lead.phone || "").replace(/[^+\d]/g, "")}`}><IconPhone />{t("d.call")}</a>
              <button className="btn btn--soft btn--sm" type="button" disabled={act === "call" || !lead.phone} onClick={logCall}>{act === "call" ? t("d.saving") : t("d.logCall")}</button>
            </div>
            <div className="ldrw__noteadd">
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("d.notePh")} />
              <button className="btn btn--pri btn--sm" type="button" disabled={!note.trim() || act === "note"} onClick={addNote}><IconSend />{act === "note" ? t("d.saving") : t("d.addNote")}</button>
            </div>
            <div className="ldrw__remind">
              <DatePicker value={remind} onChange={setRemind} placeholder={t("d.reminder")} ariaLabel={t("d.reminder")} />
              <button className="btn btn--line btn--sm" type="button" disabled={!remind || act === "rem"} onClick={setReminder}>{act === "rem" ? t("d.saving") : t("d.setReminder")}</button>
            </div>
            {msg ? <Notice ok={msg.ok} msg={msg.msg} /> : null}
          </div>

          {/* Timeline */}
          <div className="ldrw__sec">
            <span className="ldrw__lbl">{t("d.timeline")}</span>
            {tl.status === "loading" ? (
              <Skeleton rows={3} />
            ) : !tl.data.length ? (
              <p className="ldrw__empty"><IconClock />{t("d.noTimeline")}</p>
            ) : (
              <ol className="ldrw__tl">
                {tl.data.map((a) => (
                  <li key={a.id}>
                    <span className="ldrw__dot" />
                    <div>
                      <b>{a.action || a.detail || "—"}</b>
                      {a.detail && a.action ? <span>{a.detail}</span> : null}
                      <em>{a.createdAt ? fmtDate(a.createdAt.slice(0, 10), locale) : ""}</em>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="ldrw__foot">
          <button className="btn btn--line btn--sm" type="button" disabled={busy} onClick={onDelete}>{t("d.delete")}</button>
        </div>
      </aside>
    </>
  );
}
