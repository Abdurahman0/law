"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { ADVOCATE_METRICS, OPPORTUNITIES, VIEWS_TREND } from "@/lib/mock/advocate";
import {
  IconEye,
  IconChatDots,
  IconTrendingUp,
  IconStar,
  IconBolt,
  IconArrowRight,
  IconClock,
  IconMapPin,
} from "@/components/icons";

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${(28 - ((v - min) / r) * 26 - 1).toFixed(1)}`).join(" ");
  return (
    <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--b600)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdvocateDashboard() {
  const t = useTranslations("portal.advocate.dashboard");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");
  const { session } = useAuth();
  const m = ADVOCATE_METRICS;
  const completeness = session?.completeness ?? m.completeness;

  return (
    <>
      <div className="advhero">
        <div className="advhero__t">
          <span className="advhero__k">{t("kicker")}</span>
          <h2 className="psec-h" style={{ color: "#fff" }}>{t("hi", { name: session?.name ?? "" })}</h2>
          <p>{t("sub")}</p>
        </div>
        <div className="advhero__done">
          <div className="ring" style={{ "--v": `${completeness}%` } as React.CSSProperties}>
            <b>{completeness}%</b>
          </div>
          <div>
            <b>{t("completeness")}</b>
            <span>{t("completenessHint")}</span>
            <Link href="/portal/advocate/profile" className="btn btn--glass btn--sm" style={{ marginTop: 8 }}>
              {t("completeCta")}
            </Link>
          </div>
        </div>
      </div>

      <div className="amet">
        <div className="amet__c">
          <span className="amet__i"><IconEye /></span>
          <b>{m.profileViews.toLocaleString("ru-RU").replace(/,/g, " ")}</b>
          <span className="amet__l">{t("profileViews")}</span>
          <em className="amet__d amet__d--up"><IconTrendingUp />+{m.profileViewsDeltaPct}%</em>
          <Spark data={VIEWS_TREND} />
        </div>
        <div className="amet__c">
          <span className="amet__i"><IconChatDots /></span>
          <b>{m.contactRequests}</b>
          <span className="amet__l">{t("contactRequests")}</span>
          <em className="amet__d amet__d--up"><IconTrendingUp />{t("thisWeek")}</em>
        </div>
        <div className="amet__c">
          <span className="amet__i"><IconTrendingUp /></span>
          <b>#{m.searchRank}</b>
          <span className="amet__l">{t("searchRank")}</span>
          <em className="amet__d amet__d--up"><IconTrendingUp />+{m.searchRankDelta} {t("places")}</em>
        </div>
        <div className="amet__c">
          <span className="amet__i"><IconStar /></span>
          <b>{m.rating.toFixed(1)}</b>
          <span className="amet__l">{t("rating")}</span>
          <em className="amet__d">{m.reviews} {t("reviews")}</em>
        </div>
      </div>

      <div className="pgrid2">
        <div className="ppanel">
          <div className="ppanel__h">
            <b>{t("opportunities")}</b>
            <Link href="/portal/advocate/opportunities">{tc("viewAll")}</Link>
          </div>
          <p className="advmuted">{t("opportunitiesSub")}</p>
          <div className="pcards">
            {OPPORTUNITIES.map((o) => (
              <div className="oppc" key={o.id}>
                <div className="oppc__h">
                  <span className="oppc__match">{o.matchPct}% {t("match")}</span>
                  <span className="oppc__ago"><IconClock />{o.postedAgoMin}m</span>
                </div>
                <b>{o.title}</b>
                <small>
                  <IconMapPin />{te(`regions.${o.region}`)} · {te(`areas.${o.areaKey}`)} · {o.budget} {te("currency")}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="ppanel advboost">
          <div className="ppanel__h">
            <b>{t("boostTitle")}</b>
          </div>
          <div className="advboost__rank">
            <span>{t("currentRank")}</span>
            <b>#{m.searchRank}</b>
          </div>
          <div className="meter"><span style={{ width: `${m.responseRatePct}%` }} /></div>
          <p className="advmuted" style={{ marginTop: 8 }}>{t("responseRate", { pct: m.responseRatePct })}</p>
          <Link href="/portal/advocate/promotion" className="btn btn--grad btn--full" style={{ marginTop: 14 }}>
            <IconBolt />
            {t("boostCta")}
          </Link>
          <Link href="/portal/advocate/subscription" className="btn btn--line btn--full" style={{ marginTop: 10 }}>
            {t("upgradeCta")}
            <IconArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
}
