"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { getRetentionOverview, addRetentionQueue } from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import { IconAlert, IconUsers, IconTrendingUp, IconCheck } from "@/components/icons";

const EMPTY = { atRisk: 0, churnedThisMonth: 0, retainedPct: 0, atRiskClients: [], upsell: [] };

export default function AdminRetention() {
  const t = useTranslations("admin.retention");
  const res = useResourceOne(getRetentionOverview, []);
  const d = res.data ?? EMPTY;
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function winBack(c: { name: string; phone: string; reason: string }) {
    setBusy(c.phone);
    setNote(null);
    try {
      await addRetentionQueue({ phone: c.phone, note: c.reason, offer: "win_back" });
      setNote({ ok: true, msg: t("winBackDone", { name: c.name || c.phone }) });
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("title")}</b></div>
        {res.status === "loading" ? (
          <Skeleton rows={3} />
        ) : (
          <>
            <div className="castat">
              <div className="castat__c"><span className="castat__i castat__i--bad"><IconAlert /></span><b>{d.atRisk}</b><span>{t("atRisk")}</span></div>
              <div className="castat__c"><span className="castat__i"><IconUsers /></span><b>{d.churnedThisMonth}</b><span>{t("churned")}</span></div>
              <div className="castat__c"><span className="castat__i castat__i--ok"><IconTrendingUp /></span><b>{d.retainedPct}%</b><span>{t("retained")}</span></div>
            </div>
          </>
        )}
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h"><b>{t("atRiskTitle")}</b></div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          {res.status === "loading" ? <Skeleton rows={2} /> : !d.atRiskClients.length ? (
            <p className="advmuted">{t("noRisk")}</p>
          ) : (
            <div className="alist">
              {d.atRiskClients.map((c, i) => (
                <div className="creq" key={i}>
                  <span className="creq__st" />
                  <div className="creq__m"><b>{c.name || c.phone}</b><span>{[c.reason, c.lastActive].filter(Boolean).join(" · ")}</span></div>
                  <button className="btn btn--soft btn--sm" type="button" disabled={busy === c.phone} onClick={() => winBack(c)}>{busy === c.phone ? t("adding") : t("winBack")}</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ppanel">
          <div className="ppanel__h"><b>{t("upsellTitle")}</b></div>
          {res.status === "loading" ? <Skeleton rows={2} /> : !d.upsell.length ? (
            <p className="advmuted">{t("noUpsell")}</p>
          ) : (
            <div className="alist">
              {d.upsell.map((u, i) => (
                <div className="creq" key={i}>
                  <span className="creq__st" />
                  <div className="creq__m"><b>{u.name}</b><span>{u.suggestion}</span></div>
                  <span className="creq__badge"><IconCheck /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
