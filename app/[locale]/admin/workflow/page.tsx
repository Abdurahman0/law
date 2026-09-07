"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { listWorkflowRules, runWorkflowRule, listWorkflowRuns } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { useReload } from "@/components/admin/AdminBits";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconBolt, IconCheck } from "@/components/icons";

function fmt(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("ru-RU");
}

export default function AdminWorkflow() {
  const t = useTranslations("admin.workflow");
  const [key, reload] = useReload();
  const rules = useResource(() => listWorkflowRules(), [key]);
  const runs = useResource(() => listWorkflowRuns(), [key]);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(id: string) {
    setBusy(id);
    try {
      await runWorkflowRule(id);
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pgrid2">
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("rules")}</b><span className="advmuted">{rules.data.length}</span></div>
        <p className="ppanel__note">{t("lead")}</p>
        {rules.status === "loading" ? (
          <Skeleton rows={3} />
        ) : !rules.data.length ? (
          <EmptyState icon={<IconBolt />} title={t("noRules")} text={t("noRulesText")} />
        ) : (
          <div className="alist">
            {rules.data.map((r) => (
              <div className="aitem" key={r.id}>
                <span className="aitem__n"><IconBolt /></span>
                <div className="aitem__m">
                  <b>{r.title || "—"}</b>
                  <span className="aitem__meta">{r.description || (r.status ? (t.has(`status.${r.status}`) ? t(`status.${r.status}`) : r.status) : "")}</span>
                </div>
                <button className="btn btn--pri btn--sm" type="button" disabled={busy === r.id} onClick={() => run(r.id)}>{busy === r.id ? t("running") : t("run")}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ppanel">
        <div className="ppanel__h"><b>{t("runs")}</b><span className="advmuted">{runs.data.length}</span></div>
        {runs.status === "loading" ? (
          <Skeleton rows={3} />
        ) : !runs.data.length ? (
          <p className="advmuted">{t("noRuns")}</p>
        ) : (
          <div className="alist">
            {runs.data.map((r) => (
              <div className="creq" key={r.id}>
                <span className="creq__st" />
                <div className="creq__m"><b>{r.title || "—"}</b><span>{fmt(r.createdAt)}</span></div>
                <span className="creq__badge">{r.status === "completed" ? <><IconCheck /> {t("completed")}</> : (r.status ? (t.has(`status.${r.status}`) ? t(`status.${r.status}`) : r.status) : "")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
