"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLeadTimeline, type KanbanColumn, type Lead } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { fmtDate } from "@/lib/date";
import { Skeleton } from "@/components/portal/DataState";
import { IconClose, IconClock, IconUsers } from "@/components/icons";

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
  const tl = useResource(() => getLeadTimeline(lead.id), [lead.id]);

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
