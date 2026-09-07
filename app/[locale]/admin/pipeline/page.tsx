"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { listLeads, adminUpdateLead, reengageLead, type Lead } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { useReload } from "@/components/admin/AdminBits";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconTrendingUp, IconChevronLeft, IconChevronRight, IconUsers } from "@/components/icons";

// Ordered sales-funnel stages. Lead.status is a free-form string on the
// backend; legacy values are mapped into these columns.
const STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Stage = (typeof STAGES)[number];

const LEGACY: Record<string, Stage> = {
  new: "new",
  in_progress: "contacted",
  contacted: "contacted",
  qualified: "qualified",
  proposal: "qualified",
  converted: "won",
  won: "won",
  rejected: "lost",
  lost: "lost",
};

function stageOf(status: string): Stage {
  return LEGACY[status?.toLowerCase()] ?? "new";
}

export default function AdminPipeline() {
  const t = useTranslations("admin.pipeline");
  const [key, reload] = useReload();
  const res = useResource(listLeads, [key]);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  async function moveTo(id: string, stage: Stage) {
    const lead = res.data.find((l) => l.id === id);
    if (!lead || stageOf(lead.status) === stage) return;
    setBusy(id);
    try {
      await adminUpdateLead(id, { status: stage });
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  const columns = useMemo(() => {
    const by: Record<Stage, Lead[]> = { new: [], contacted: [], qualified: [], won: [], lost: [] };
    for (const l of res.data) by[stageOf(l.status)].push(l);
    return by;
  }, [res.data]);

  async function move(l: Lead, dir: number) {
    const cur = STAGES.indexOf(stageOf(l.status));
    const next = STAGES[Math.min(STAGES.length - 1, Math.max(0, cur + dir))];
    if (next === STAGES[cur]) return;
    setBusy(l.id);
    try {
      await adminUpdateLead(l.id, { status: next });
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }
  async function reengage(l: Lead) {
    setBusy(l.id);
    try {
      // Dedicated endpoint records callback metadata + moves the lead back.
      await reengageLead(l.id).catch(() => adminUpdateLead(l.id, { status: "new" }));
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
        <span className="advmuted">{res.data.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconTrendingUp />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="pipe">
          {STAGES.map((s, si) => (
            <div
              className={`pipe__col pipe__col--${s}${overStage === s ? " pipe__col--over" : ""}`}
              key={s}
              onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverStage(s); } }}
              onDragLeave={() => setOverStage((cur) => (cur === s ? null : cur))}
              onDrop={() => { if (dragId) moveTo(dragId, s); setDragId(null); setOverStage(null); }}
            >
              <div className="pipe__head">
                <span className="pipe__dot" />
                <b>{t(`stages.${s}`)}</b>
                <span className="pipe__count">{columns[s].length}</span>
              </div>
              <div className="pipe__cards">
                {columns[s].length === 0 ? (
                  <div className="pipe__empty">{t("noneHere")}</div>
                ) : (
                  columns[s].map((l) => (
                    <div
                      className={`pipe__card${dragId === l.id ? " pipe__card--drag" : ""}`}
                      key={l.id}
                      draggable
                      onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    >
                      <div className="pipe__ctop">
                        <b>{l.name || l.phone || l.category || "—"}</b>
                        {l.score ? <span className="pipe__score">{l.score}</span> : null}
                      </div>
                      <span className="pipe__meta">
                        {[l.phone, l.category, l.region].filter(Boolean).join(" · ") || t("noInfo")}
                      </span>
                      {l.note ? <span className="pipe__note">{l.note}</span> : null}
                      {s === "lost" ? (
                        <button type="button" className="pipe__reengage" disabled={busy === l.id} onClick={() => reengage(l)}>
                          {t("reengage")}
                        </button>
                      ) : null}
                      <div className="pipe__actions">
                        <button
                          type="button"
                          className="pipe__mv"
                          disabled={si === 0 || busy === l.id}
                          onClick={() => move(l, -1)}
                          aria-label={t("moveBack")}
                        >
                          <IconChevronLeft />
                        </button>
                        <span className="pipe__src">{l.source || <IconUsers />}</span>
                        <button
                          type="button"
                          className="pipe__mv"
                          disabled={si === STAGES.length - 1 || busy === l.id}
                          onClick={() => move(l, 1)}
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
