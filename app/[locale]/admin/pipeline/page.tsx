"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { getLeadKanban, moveLeadKanban, type KanbanColumn } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { useReload } from "@/components/admin/AdminBits";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconTrendingUp, IconChevronLeft, IconChevronRight, IconUsers } from "@/components/icons";

export default function AdminPipeline() {
  const t = useTranslations("admin.pipeline");
  const [key, reload] = useReload();
  const res = useResource<KanbanColumn>(getLeadKanban, [key]);
  const cols = res.data;
  const [busy, setBusy] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const total = useMemo(() => cols.reduce((n, c) => n + c.count, 0), [cols]);
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
  // Arrow move: shift the card to the adjacent column (by order), appended.
  function shift(leadId: string, fromKey: string, dir: number) {
    const i = orderOf(fromKey);
    const next = cols[i + dir];
    if (next) moveTo(leadId, next.key, next.cards.length);
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{total}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !cols.length ? (
        <EmptyState icon={<IconTrendingUp />} title={t("empty")} text={t("emptyText")} />
      ) : (
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
                      onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }}
                      onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    >
                      <div className="pipe__ctop">
                        <b>{l.name || l.phone || l.category || "—"}</b>
                        {l.score ? <span className="pipe__score">{l.score}</span> : null}
                      </div>
                      <span className="pipe__meta">
                        {[l.phone, l.category, l.region].filter(Boolean).join(" · ") || t("noInfo")}
                      </span>
                      {l.note ? <span className="pipe__note">{l.note}</span> : null}
                      <div className="pipe__actions">
                        <button
                          type="button"
                          className="pipe__mv"
                          disabled={ci === 0 || busy === l.id}
                          onClick={() => shift(l.id, col.key, -1)}
                          aria-label={t("moveBack")}
                        >
                          <IconChevronLeft />
                        </button>
                        <span className="pipe__src">{l.source ? (t.has(`source.${l.source}`) ? t(`source.${l.source}`) : l.source) : <IconUsers />}</span>
                        <button
                          type="button"
                          className="pipe__mv"
                          disabled={ci === cols.length - 1 || busy === l.id}
                          onClick={() => shift(l.id, col.key, 1)}
                          aria-label={t("moveFwd")}
                        >
                          <IconChevronRight />
                        </button>
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
