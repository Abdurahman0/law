"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { listAds, createAd, type ModuleRecord } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { IconRocket, IconTrendingUp } from "@/components/icons";

const som = (n: number) => (n ? n.toLocaleString("ru-RU").replace(/,/g, " ") : "0");
const numOf = (v: unknown, fallback: number) => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export default function PromotionPanel() {
  const t = useTranslations("promotion");
  // Promo packages come from the /ads/products catalog. Exclude the records we
  // ourselves create for requests (record_type "promo_request").
  const res = useResource(
    () => listAds().then((all) => all.filter((a) => a.recordType !== "promo_request")),
    [],
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [active, setActive] = useState<{ days: number } | null>(null);
  const [err, setErr] = useState(false);

  async function buy(pkg: ModuleRecord, days: number) {
    if (busy) return;
    setBusy(pkg.id);
    setErr(false);
    try {
      await createAd({
        title: pkg.title,
        record_type: "promo_request",
        price: pkg.price,
        status: "requested",
        payload: { package_id: pkg.id, days },
      });
      setActive({ days });
    } catch {
      setErr(true);
    } finally {
      setBusy(null);
    }
  }

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
      </div>

      {active ? (
        <div className="promo__active">
          <IconRocket />
          {t("activeMsg", { days: active.days })}
        </div>
      ) : null}

      <div className="ppanel" style={{ marginTop: 18 }}>
        <div className="ppanel__h">
          <b>{t("packagesTitle")}</b>
        </div>

        {res.status === "loading" ? (
          <Skeleton rows={3} />
        ) : !res.data.length ? (
          <EmptyState icon={<IconRocket />} title={t("empty")} text={t("emptyText")} />
        ) : (
          <>
            <div className="promo__packs">
              {res.data.map((pkg, i) => {
                const days = numOf(pkg.payload.days, 7);
                const reach = numOf(pkg.payload.reach, i + 2);
                const feat = i === 1 || res.data.length === 1;
                return (
                  <div key={pkg.id} className={`ppack${feat ? " ppack--feat" : ""}`}>
                    {feat ? <span className="ppack__ribbon">{t("popular")}</span> : null}
                    <b>{pkg.title}</b>
                    <span className="ppack__days">{t("days", { d: days })}</span>
                    <span className="ppack__reach">
                      <IconTrendingUp />
                      {t("reach", { x: reach })}
                    </span>
                    <span className="ppack__price">
                      {som(pkg.price)} <span>{t("som")}</span>
                    </span>
                    <button
                      type="button"
                      className={`btn ${feat ? "btn--grad" : "btn--line"} btn--full`}
                      disabled={busy === pkg.id}
                      onClick={() => buy(pkg, days)}
                    >
                      {busy === pkg.id ? t("processing") : t("buy")}
                    </button>
                  </div>
                );
              })}
            </div>
            {err ? (
              <p className="disc" style={{ color: "#C0392B" }}>{t("emptyText")}</p>
            ) : null}
            <p className="promo__note">{t("boostNote")}</p>
          </>
        )}
      </div>
    </div>
  );
}
