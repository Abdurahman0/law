"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import {
  CLIENT_REQUESTS,
  MATCHED_SPECIALISTS,
  CLIENT_QUICK_ACTIONS,
  JOURNEY_STAGES,
} from "@/lib/mock/client";
import { initials } from "@/lib/lawyers";
import type { RequestStatus } from "@/lib/types";
import {
  Icon,
  IconSparkle,
  IconSend,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconStar,
  IconCheck,
} from "@/components/icons";

const STAGE_OF: Record<RequestStatus, number> = {
  analyzing: 1,
  matching: 2,
  consultation: 3,
  inProgress: 3,
  resolved: 4,
};

export default function ClientDashboard() {
  const t = useTranslations("portal.client.dashboard");
  const tj = useTranslations("portal.client.journey");
  const tr = useTranslations("portal.client.reqStatus");
  const tn = useTranslations("portal.client.nextActions");
  const ta = useTranslations("portal.client.actions");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const tcat = useTranslations("catalog");
  const { session } = useAuth();
  const router = useRouter();
  const [ask, setAsk] = useState("");

  const active = CLIENT_REQUESTS.filter((r) => r.status !== "resolved");
  const primary = active[0] ?? CLIENT_REQUESTS[0];
  const stage = primary ? STAGE_OF[primary.status] : 0;

  function describe() {
    const q = ask.trim();
    router.push(`/portal/client/ai${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }

  return (
    <>
      {/* Hero — the WOW first screen */}
      <div className="cdhero">
        <div className="cdhero__glow" />
        <span className="cdhero__hi">{t("hi", { name: session?.name ?? "" })}</span>
        <h2 className="cdhero__title">{t("heroTitle")}</h2>
        <p className="cdhero__sub">{t("heroSub")}</p>
        <div className="cdhero__ask">
          <IconSparkle />
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") describe();
            }}
            placeholder={t("askPh")}
            aria-label={t("askPh")}
          />
          <button type="button" onClick={describe} aria-label={t("askBtn")}>
            <IconSend />
          </button>
        </div>
        <div className="cdhero__trust">
          <span><IconShieldCheck />{t("trust1")}</span>
          <span><IconClock />{t("trust2")}</span>
          <span><IconCheck />{t("trust3")}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="cdact">
        {CLIENT_QUICK_ACTIONS.map((a) => (
          <Link
            href={a.href}
            key={a.key}
            className={`cdact__i${a.primary ? " cdact__i--pri" : ""}`}
          >
            <span className="cdact__ico"><Icon name={a.icon} /></span>
            {ta(a.key)}
          </Link>
        ))}
      </div>

      {/* Legal journey — signature visualization */}
      <div className="ppanel">
        <div className="ppanel__h">
          <b>{tj("title")}</b>
          {primary ? <span className="advmuted">{primary.title}</span> : null}
        </div>
        <div className="journey">
          {JOURNEY_STAGES.map((s, i) => (
            <div
              key={s}
              className={`journey__s${i < stage ? " done" : ""}${i === stage ? " on" : ""}`}
            >
              <span className="journey__dot">{i < stage ? <IconCheck /> : i + 1}</span>
              <span className="journey__lbl">{tj(s)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pgrid2">
        {/* Active requests */}
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("requests")}</b>
            <Link href="/portal/client/cases">{tc("viewAll")}</Link>
          </div>
          {active.length ? (
            active.map((r) => (
              <div className="creq" key={r.id}>
                <span className={`creq__st creq__st--${r.status}`} />
                <div className="creq__m">
                  <b>{r.title}</b>
                  <span>
                    {tcat(`${r.categoryKey}.name`)}
                    {r.specialist ? ` · ${r.specialist}` : ""}
                  </span>
                  <em className="creq__next">
                    <IconArrowRight />
                    {tn(r.nextActionKey)}
                  </em>
                </div>
                <div className="creq__side">
                  <span className="creq__badge">{tr(r.status)}</span>
                  {r.unread ? <span className="creq__unread">{r.unread}</span> : null}
                </div>
              </div>
            ))
          ) : (
            <div className="pempty">
              <IconSparkle />
              <b>{t("emptyTitle")}</b>
              <p>{t("emptyText")}</p>
            </div>
          )}
        </div>

        {/* Smart specialist matching */}
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("matchTitle")}</b>
            <Link href="/portal/client/lawyers">{tc("viewAll")}</Link>
          </div>
          <p className="advmuted" style={{ marginBottom: 12 }}>{t("matchSub")}</p>
          {MATCHED_SPECIALISTS.map((s) => (
            <div className="cmatch" key={s.id}>
              <span className="cmatch__av">{initials(s.name)}</span>
              <div className="cmatch__m">
                <b>
                  {s.name}
                  {s.verified ? <span className="cmatch__v"><IconShieldCheck /></span> : null}
                </b>
                <span>
                  {te(`areas.${s.areaKey}`)} · <IconStar className="cmatch__star" />
                  {s.rating.toFixed(1)} ({s.reviews})
                </span>
              </div>
              <div className="cmatch__side">
                <span className="cmatch__pct">{s.matchPct}%</span>
                <span className="cmatch__pl">{t("match")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
