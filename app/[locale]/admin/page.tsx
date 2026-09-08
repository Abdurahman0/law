"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import {
  getAdminDashboard,
  getCeoDashboard,
  getRetentionOverview,
  getQualityOverview,
  seedDemoData,
} from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "@/components/portal/DataState";
import {
  IconBolt,
  IconUsers,
  IconTrendingUp,
  IconAward,
  IconCard,
  IconShieldCheck,
  IconBuilding,
  IconPhone,
  IconArrowRight,
} from "@/components/icons";

const human = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const fmt = (n: number) => (Math.abs(n) >= 1000 ? n.toLocaleString("ru-RU").replace(/,/g, " ") : String(n));
const DASH = "—";

// CRM module quick-links surfaced on the command dashboard.
const MODULES = [
  { href: "/admin/leads", key: "leads", Icon: IconUsers },
  { href: "/admin/pipeline", key: "pipeline", Icon: IconTrendingUp },
  { href: "/admin/verifications", key: "verifications", Icon: IconAward },
  { href: "/admin/payouts", key: "payouts", Icon: IconCard },
  { href: "/admin/quality", key: "quality", Icon: IconShieldCheck },
  { href: "/admin/b2b", key: "b2b", Icon: IconBuilding },
  { href: "/admin/retention", key: "retention", Icon: IconUsers },
  { href: "/admin/call-center", key: "callCenter", Icon: IconPhone },
];

function Tile({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="ktile">
      <span className="ktile__l">{label}</span>
      <b className="ktile__v">{value}</b>
      {typeof delta === "number" && delta !== 0 ? (
        <span className={`ktile__d ktile__d--${delta > 0 ? "up" : "down"}`}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </span>
      ) : null}
    </div>
  );
}

export default function AdminOverview() {
  const t = useTranslations("admin.overview");
  const tc = useTranslations("admin.overview.crm");
  const tn = useTranslations("admin");
  const { session } = useAuth();
  const dash = useResourceOne(getAdminDashboard, []);
  const ceo = useResourceOne(getCeoDashboard, []);
  const ret = useResourceOne(getRetentionOverview, []);
  const qual = useResourceOne(getQualityOverview, []);
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

  const c = ceo.data;
  const r = ret.data;
  const q = qual.data;
  const money = (n?: number) => (n ? `${fmt(n)} ${tc("som")}` : DASH);
  const pct = (n?: number) => (n || n === 0 ? `${Math.round(n)}%` : DASH);
  const arpu = c && c.users ? Math.round(c.revenue / c.users) : 0;
  const funnel = c?.funnel ?? [];
  const fMax = Math.max(...funnel.map((f) => f.value), 1);

  const loading = ceo.status === "loading" && ret.status === "loading" && qual.status === "loading";

  return (
    <>
      <div className="advhero">
        <div className="advhero__t">
          <span className="advhero__k">{tc("kicker")}</span>
          <h2 className="psec-h" style={{ color: "#fff" }}>{t("hi", { name: session?.name ?? "" })}</h2>
          <p>{tc("sub")}</p>
        </div>
        <div className="advhero__done" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
          <button className="btn btn--glass btn--sm" type="button" onClick={seed} disabled={seedBusy}>
            <IconBolt />
            {seedBusy ? t("seeding") : t("seed")}
          </button>
          {seedMsg ? <span style={{ fontSize: ".8rem", color: "#B7CDEC" }}>{seedMsg}</span> : null}
        </div>
      </div>

      {loading ? <Skeleton rows={4} /> : null}

      {/* KPI command grid — grouped per the platform plan */}
      <div className="kgrid">
        <section className="ksec">
          <h3 className="ksec__h">{tc("growth")}</h3>
          <div className="ksec__tiles">
            <Tile label={tc("users")} value={c ? fmt(c.users) : DASH} />
            <Tile label={tc("active")} value={c ? fmt(c.activeUsers) : DASH} />
            <Tile label={tc("conversion")} value={pct(c?.conversionPct)} />
          </div>
        </section>

        <section className="ksec">
          <h3 className="ksec__h">{tc("monetization")}</h3>
          <div className="ksec__tiles">
            <Tile label={tc("revenue")} value={money(c?.revenue)} delta={c?.revenueDeltaPct} />
            <Tile label={tc("mrr")} value={money(c?.mrr)} />
            <Tile label={tc("arpu")} value={arpu ? money(arpu) : DASH} />
          </div>
        </section>

        <section className="ksec">
          <h3 className="ksec__h">{tc("retention")}</h3>
          <div className="ksec__tiles">
            <Tile label={tc("retained")} value={pct(r?.retainedPct)} />
            <Tile label={tc("churn")} value={r ? fmt(r.churnedThisMonth) : DASH} />
            <Tile label={tc("atRisk")} value={r ? fmt(r.atRisk) : DASH} />
          </div>
        </section>

        <section className="ksec">
          <h3 className="ksec__h">{tc("quality")}</h3>
          <div className="ksec__tiles">
            <Tile label={tc("rating")} value={q?.avgRating ? q.avgRating.toFixed(1) : DASH} />
            <Tile label={tc("sla")} value={pct(q?.responseSlaPct)} />
            <Tile label={tc("complaints")} value={pct(q?.complaintRate)} />
            <Tile label={tc("resolved")} value={pct(q?.resolvedPct)} />
          </div>
        </section>
      </div>

      <div className="pgrid2">
        {/* Sales funnel */}
        <div className="ppanel">
          <div className="ppanel__h"><b>{tc("funnel")}</b></div>
          {funnel.length ? (
            <div className="kfunnel">
              {funnel.map((f, i) => (
                <div className="kfunnel__row" key={i}>
                  <span className="kfunnel__lbl">{f.label}</span>
                  <span className="kfunnel__bar"><span style={{ width: `${Math.max(4, (f.value / fMax) * 100)}%` }} /></span>
                  <b className="kfunnel__v">{fmt(f.value)}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="advmuted">{t("empty")}</p>
          )}
        </div>

        {/* Revenue trend (from admin dashboard charts) */}
        <div className="ppanel">
          <div className="ppanel__h"><b>{tc("revenueTrend")}</b></div>
          {c?.revenueTrend?.length ? (
            <div className="dchart">
              {c.revenueTrend.slice(-14).map((p, i) => {
                const max = Math.max(...c.revenueTrend.map((x) => x.value), 1);
                return (
                  <div className="dbar" key={i} title={`${p.label}: ${fmt(p.value)}`}>
                    <span className="dbar__fill" style={{ height: `${Math.max(4, (p.value / max) * 100)}%` }} />
                    <span className="dbar__lbl">{p.label.slice(-5)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="advmuted">{t("empty")}</p>
          )}
        </div>
      </div>

      {/* CRM module shortcuts */}
      <div className="ppanel">
        <div className="ppanel__h"><b>{tc("modules")}</b></div>
        <div className="kmods">
          {MODULES.map(({ href, key, Icon }) => (
            <Link href={href} key={key} className="kmod">
              <span className="kmod__i"><Icon /></span>
              <span className="kmod__t">{tn(`nav.${key}`)}</span>
              <IconArrowRight className="kmod__a" />
            </Link>
          ))}
        </div>
      </div>

      {/* Raw backend totals (counts) kept for completeness */}
      {dash.data?.totals?.length ? (
        <div className="amet">
          {dash.data.totals.map((s) => (
            <div className="amet__c" key={s.label}>
              <b>{fmt(s.value)}</b>
              <span className="amet__l">{t.has(`metrics.${s.label}`) ? t(`metrics.${s.label}`) : human(s.label)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
