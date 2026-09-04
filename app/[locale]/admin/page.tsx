"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { getAdminDashboard, seedDemoData } from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { IconTrendingUp, IconBolt } from "@/components/icons";

const human = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const fmt = (n: number) => (Math.abs(n) >= 1000 ? n.toLocaleString("ru-RU").replace(/,/g, " ") : String(n));

export default function AdminOverview() {
  const t = useTranslations("admin.overview");
  const { session } = useAuth();
  const dash = useResourceOne(getAdminDashboard, []);
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function seed() {
    if (seedBusy) return;
    setSeedBusy(true);
    setSeedMsg(null);
    try {
      const r = await seedDemoData();
      setSeedMsg(r.message || t("seedDone", { templates: r.templates, ads: r.adsProducts }));
    } catch {
      setSeedMsg(t("seedError"));
    } finally {
      setSeedBusy(false);
    }
  }

  return (
    <>
      <div className="advhero">
        <div className="advhero__t">
          <span className="advhero__k">{t("kicker")}</span>
          <h2 className="psec-h" style={{ color: "#fff" }}>{t("hi", { name: session?.name ?? "" })}</h2>
          <p>{t("sub")}</p>
        </div>
        <div className="advhero__done" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
          <button className="btn btn--glass btn--sm" type="button" onClick={seed} disabled={seedBusy}>
            <IconBolt />
            {seedBusy ? t("seeding") : t("seed")}
          </button>
          {seedMsg ? <span style={{ fontSize: ".8rem", color: "#B7CDEC" }}>{seedMsg}</span> : null}
        </div>
      </div>

      {dash.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !dash.data || (!dash.data.totals.length && !dash.data.charts.length) ? (
        <EmptyState icon={<IconTrendingUp />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <>
          {dash.data.totals.length ? (
            <div className="amet">
              {dash.data.totals.map((s) => (
                <div className="amet__c" key={s.label}>
                  <b>{fmt(s.value)}</b>
                  <span className="amet__l">{human(s.label)}</span>
                </div>
              ))}
            </div>
          ) : null}

          {dash.data.charts.filter((c) => c.points.length).length ? (
            <div className="pgrid2">
              {dash.data.charts
                .filter((c) => c.points.length)
                .map((c) => {
                  const max = Math.max(...c.points.map((p) => p.value), 1);
                  return (
                    <div className="ppanel" key={c.key}>
                      <div className="ppanel__h">
                        <b>{human(c.key)}</b>
                      </div>
                      <div className="dchart">
                        {c.points.slice(-14).map((p, i) => (
                          <div className="dbar" key={i} title={`${p.label}: ${p.value}`}>
                            <span className="dbar__fill" style={{ height: `${Math.max(4, (p.value / max) * 100)}%` }} />
                            <span className="dbar__lbl">{p.label.slice(-5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
