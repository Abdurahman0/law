"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PROMO_PACKAGES, PROMO_STATS, PROMO_TREND } from "@/lib/mock/promotion";
import { buyPromotion } from "@/lib/services/billing";
import {
  IconTrendingUp,
  IconEye,
  IconTarget,
  IconRocket,
  IconSearch,
  IconChatDots,
  IconCheck,
} from "@/components/icons";

function som(n: number): string {
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 28 - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--b600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PromotionPanel() {
  const t = useTranslations("promotion");
  const [busy, setBusy] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const s = PROMO_STATS;

  async function buy(days: number) {
    if (busy) return;
    setBusy(days);
    const res = await buyPromotion(days);
    setBusy(null);
    if (res.ok) setActive(days);
  }

  const analytics = [
    { k: "impressions", v: som(s.impressions), Icon: IconEye },
    { k: "searchAppearances", v: som(s.searchAppearances), Icon: IconSearch },
    { k: "profileClicks", v: som(s.profileClicks), Icon: IconTarget },
    { k: "contactRequests", v: som(s.contactRequests), Icon: IconChatDots },
  ];

  return (
    <div className="promo">
      <div className="promo__hero">
        <div className="promo__hero-t">
          <span className="kick" style={{ color: "var(--b300)", background: "rgba(92,168,255,.16)" }}>
            <IconRocket />
            {t("kicker")}
          </span>
          <h2 className="h2" style={{ color: "#fff" }}>{t("title")}</h2>
          <p className="lead" style={{ color: "#B7CDEC" }}>{t("intro")}</p>
        </div>
        <div className="promo__gauge">
          <b>#{active ? Math.max(1, s.searchPosition - 12) : s.searchPosition}</b>
          <span>{t("position")}</span>
        </div>
      </div>

      {active ? (
        <div className="promo__active">
          <IconCheck />
          {t("activeMsg", { days: active })}
        </div>
      ) : null}

      <div className="promo__status">
        <div className="promo__scard">
          <div className="promo__scard-h">
            <span><IconEye />{t("visibility")}</span>
            <b>{s.visibilityPct}%</b>
          </div>
          <div className="meter"><span style={{ width: `${s.visibilityPct}%` }} /></div>
        </div>
        <div className="promo__scard">
          <div className="promo__scard-h">
            <span><IconTrendingUp />{t("impressionsTrend")}</span>
            <b className="cy">+{s.estReachIncreasePct}%</b>
          </div>
          <Sparkline data={PROMO_TREND} />
        </div>
      </div>

      <h3 className="psec-h" style={{ marginBottom: 12 }}>{t("analyticsTitle")}</h3>
      <div className="promo__analytics">
        {analytics.map(({ k, v, Icon }) => (
          <div className="promo__acard" key={k}>
            <span className="promo__ai"><Icon /></span>
            <b>{v}</b>
            <span>{t(k)}</span>
          </div>
        ))}
      </div>

      <h3 className="psec-h" style={{ margin: "22px 0 12px" }}>{t("packagesTitle")}</h3>
      <div className="promo__packs">
        {PROMO_PACKAGES.map((pk) => (
          <div key={pk.days} className={`ppack${pk.featured ? " ppack--feat" : ""}`}>
            {pk.featured ? <span className="ppack__ribbon">{t("popular")}</span> : null}
            <b className="ppack__days">{t("days", { d: pk.days })}</b>
            <span className="ppack__reach">
              <IconTrendingUp />
              {t("reach", { x: pk.reachMultiplier })}
            </span>
            <div className="ppack__price">{som(pk.price)} <span>{t("som")}</span></div>
            <button
              type="button"
              className={`btn ${pk.featured ? "btn--grad" : "btn--line"} btn--full`}
              disabled={busy === pk.days || active === pk.days}
              onClick={() => buy(pk.days)}
            >
              {active === pk.days ? t("activeShort") : busy === pk.days ? t("processing") : t("buy")}
            </button>
          </div>
        ))}
      </div>
      <p className="promo__note">{t("boostNote")}</p>
    </div>
  );
}
