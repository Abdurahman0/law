"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { getLeadKanban, moveLeadKanban, adminCreateLead, adminDeleteLead, type KanbanColumn, type Lead } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { AdminForm, useReload } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import LeadDrawer from "@/components/admin/LeadDrawer";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconTrendingUp, IconChevronLeft, IconChevronRight, IconUsers, IconGrid, IconDocLines, IconPlus, IconSearch } from "@/components/icons";

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

  // Filters (client-side over the loaded board).
  const [q, setQ] = useState("");
  const [fSource, setFSource] = useState("");
  const [fRegion, setFRegion] = useState("");
  const [fStage, setFStage] = useState("");
  const query = q.trim().toLowerCase();
  const matchLead = (l: Lead) =>
    (!query || `${l.name} ${l.phone} ${l.category}`.toLowerCase().includes(query)) &&
    (!fSource || l.source === fSource) &&
    (!fRegion || l.region === fRegion);
  const sources = useMemo(() => [...new Set(allCards.map((x) => x.lead.source).filter(Boolean))], [allCards]);
  const regions = useMemo(() => [...new Set(allCards.map((x) => x.lead.region).filter(Boolean))], [allCards]);
  const viewCols = useMemo(() => cols.map((c) => ({ ...c, cards: c.cards.filter((x) => matchLead(x.lead)) })), [cols, query, fSource, fRegion]);
  const rows = allCards.filter((x) => matchLead(x.lead) && (!fStage || x.colKey === fStage));

  // KPI (from the full board, not the filtered view).
  const finalTotal = cols.filter((c) => c.isFinal).reduce((n, c) => n + c.count, 0);
  const wonCount = (cols.find((c) => c.key === "won") ?? cols.filter((c) => c.isFinal)[0])?.count ?? 0;
  const active = total - finalTotal;
  const conv = total ? Math.round((wonCount / total) * 100) : 0;

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
      <p className="advmuted" style={{ marginBottom: 14 }}>{t("lead")}</p>

      {cols.length ? (
        <>
          <div className="lkpi">
            <div className="lkpi__c"><b>{total}</b><span>{t("kpi.total")}</span></div>
            <div className="lkpi__c"><b>{active}</b><span>{t("kpi.active")}</span></div>
            <div className="lkpi__c"><b>{wonCount}</b><span>{t("kpi.won")}</span></div>
            <div className="lkpi__c"><b>{conv}%</b><span>{t("kpi.conv")}</span></div>
          </div>
          <div className="lfilters">
            <span className="svsel__search"><IconSearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("f.search")} aria-label={t("f.search")} /></span>
            <Select value={fSource} onChange={setFSource} ariaLabel={t("d.source")} options={[{ value: "", label: t("f.allSource") }, ...sources.map((s) => ({ value: s, label: t.has(`source.${s}`) ? t(`source.${s}`) : s }))]} />
            <Select value={fRegion} onChange={setFRegion} ariaLabel={t("d.region")} options={[{ value: "", label: t("f.allRegion") }, ...regions.map((r) => ({ value: r, label: r }))]} />
            {view === "table" ? (
              <Select value={fStage} onChange={setFStage} ariaLabel={t("d.stage")} options={[{ value: "", label: t("f.allStage") }, ...cols.map((c) => ({ value: c.key, label: c.title }))]} />
            ) : null}
          </div>
        </>
      ) : null}

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !cols.length ? (
        <EmptyState icon={<IconTrendingUp />} title={t("empty")} text={t("emptyText")} />
      ) : view === "kanban" ? (
        <div className="pipe">
          {viewCols.map((col, ci) => (
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
                <span className="pipe__count">{query || fSource || fRegion ? col.cards.length : col.count}</span>
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
          {rows.length === 0 ? (
            <EmptyState icon={<IconUsers />} title={t("empty")} text={t("emptyText")} />
          ) : (
            rows.map(({ lead: l, colKey }, i) => (
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
