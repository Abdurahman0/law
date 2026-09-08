"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { getLeadKanban, moveLeadKanban, adminCreateLead, adminDeleteLead, type KanbanColumn, type Lead } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { AdminForm, useReload } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import LeadDrawer from "@/components/admin/LeadDrawer";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconTrendingUp, IconChevronLeft, IconChevronRight, IconUsers, IconGrid, IconDocLines, IconPlus } from "@/components/icons";

export default function AdminPipeline() {
  const t = useTranslations("admin.pipeline");
  const ta = useTranslations("admin");
  const [key, reload] = useReload();
  const res = useResource<KanbanColumn>(getLeadKanban, [key]);
  const cols = res.data;
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [busy, setBusy] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const total = useMemo(() => cols.reduce((n, c) => n + c.count, 0), [cols]);
  const allCards = useMemo(
    () => cols.flatMap((c) => c.cards.map((x) => ({ lead: x.lead, colKey: c.key }))),
    [cols],
  );
  const selected = allCards.find((x) => x.lead.id === selId) || null;
  const colTitle = (k: string) => cols.find((c) => c.key === k)?.title || k;
  const colColor = (k: string) => cols.find((c) => c.key === k)?.color || "";
  const orderOf = (k: string) => cols.findIndex((c) => c.key === k);

  async function moveTo(leadId: string, columnKey: string, position: number) {
    setBusy(leadId);
    try {
      await moveLeadKanban(leadId, columnKey, position);
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }
  function shift(leadId: string, fromKey: string, dir: number) {
    const i = orderOf(fromKey);
    const next = cols[i + dir];
    if (next) moveTo(leadId, next.key, next.cards.length);
  }
  async function remove(leadId: string) {
    if (typeof window !== "undefined" && !window.confirm(t("d.deleteConfirm"))) return;
    setBusy(leadId);
    try {
      await adminDeleteLead(leadId);
      setSelId(null);
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
          <span className="advmuted">{total}</span>
          <span className="segtab">
            <button type="button" className={view === "kanban" ? "on" : ""} onClick={() => setView("kanban")} aria-label={t("viewKanban")}><IconGrid />{t("viewKanban")}</button>
            <button type="button" className={view === "table" ? "on" : ""} onClick={() => setView("table")} aria-label={t("viewTable")}><IconDocLines />{t("viewTable")}</button>
          </span>
          <button className="btn btn--pri btn--sm" type="button" onClick={() => setAddOpen(true)}><IconPlus />{ta("form.add")}</button>
        </span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !cols.length ? (
        <EmptyState icon={<IconTrendingUp />} title={t("empty")} text={t("emptyText")} />
      ) : view === "kanban" ? (
        <div className="pipe">
          {cols.map((col, ci) => (
            <div
              className={`pipe__col${overCol === col.key ? " pipe__col--over" : ""}`}
              key={col.key}
              style={col.color ? ({ "--pipe-col": col.color } as CSSProperties) : undefined}
              onDragOver={(e) => { if (dragId) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOverCol(col.key); } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol((cur) => (cur === col.key ? null : cur)); }}
              onDrop={(e) => { e.preventDefault(); if (dragId) moveTo(dragId, col.key, col.cards.length); setDragId(null); setOverCol(null); }}
            >
              <div className="pipe__head">
                <span className="pipe__dot" style={col.color ? { background: col.color } : undefined} />
                <b>{col.title}</b>
                <span className="pipe__count">{col.count}</span>
              </div>
              <div className="pipe__cards">
                <div className={`pipe__slot${overCol === col.key && dragId ? " on" : ""}`} aria-hidden />
                {col.cards.length === 0 ? (
                  <div className="pipe__empty">{t("noneHere")}</div>
                ) : (
                  col.cards.map(({ lead: l }) => (
                    <div
                      className={`pipe__card${dragId === l.id ? " pipe__card--drag" : ""}`}
                      key={l.id}
                      draggable
                      onClick={() => setSelId(l.id)}
                      onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }}
                      onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    >
                      <div className="pipe__ctop">
                        <b>{l.name || l.phone || l.category || "—"}</b>
                        {l.score ? <span className="pipe__score">{l.score}</span> : null}
                      </div>
                      <span className="pipe__meta">{[l.phone, l.category, l.region].filter(Boolean).join(" · ") || t("noInfo")}</span>
                      {l.note ? <span className="pipe__note">{l.note}</span> : null}
                      <div className="pipe__actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="pipe__mv" disabled={ci === 0 || busy === l.id} onClick={() => shift(l.id, col.key, -1)} aria-label={t("moveBack")}><IconChevronLeft /></button>
                        <span className="pipe__src">{l.source ? (t.has(`source.${l.source}`) ? t(`source.${l.source}`) : l.source) : <IconUsers />}</span>
                        <button type="button" className="pipe__mv" disabled={ci === cols.length - 1 || busy === l.id} onClick={() => shift(l.id, col.key, 1)} aria-label={t("moveFwd")}><IconChevronRight /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alist">
          {allCards.length === 0 ? (
            <EmptyState icon={<IconUsers />} title={t("empty")} text={t("emptyText")} />
          ) : (
            allCards.map(({ lead: l, colKey }, i) => (
              <button type="button" className="aitem aitem--link" key={l.id} onClick={() => setSelId(l.id)}>
                <span className="aitem__n">{i + 1}</span>
                <div className="aitem__m">
                  <b>{l.name || l.phone || "—"}</b>
                  <span className="aitem__meta">{[l.phone, l.category, l.region].filter(Boolean).join(" · ")}</span>
                </div>
                <span className="lstage" style={colColor(colKey) ? ({ "--c": colColor(colKey) } as CSSProperties) : undefined}>{colTitle(colKey)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {selected ? (
        <LeadDrawer
          lead={selected.lead}
          colKey={selected.colKey}
          columns={cols}
          busy={busy === selected.lead.id}
          onMove={(ck) => moveTo(selected.lead.id, ck, 0)}
          onDelete={() => remove(selected.lead.id)}
          onClose={() => setSelId(null)}
        />
      ) : null}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={ta("leads.create")}>
        <AdminForm
          fields={[
            { name: "name", label: ta("leads.name"), required: true },
            { name: "phone", label: ta("leads.phone"), required: true, placeholder: "+998 __ ___ __ __" },
            { name: "category", label: ta("form.category") },
            { name: "region", label: ta("leads.region") },
            { name: "note", label: ta("leads.note"), type: "textarea" },
          ]}
          onSubmit={async (v) => void (await adminCreateLead({ name: String(v.name), phone: String(v.phone), category: String(v.category), region: String(v.region), note: String(v.note), source: "manual" }))}
          submitLabel={ta("form.save")}
          busyLabel={ta("form.saving")}
          okMsg={ta("form.created")}
          errMsg={ta("form.error")}
          onDone={() => { reload(); setAddOpen(false); }}
        />
      </Modal>
    </div>
  );
}
