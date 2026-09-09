"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getLawyerStats,
  listOpenOrders,
  type SellerStats,
  type BackendOrder,
} from "@/lib/services/backend";
import { useResource, useResourceOne } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import OrderActions from "./OrderActions";
import type { Role } from "@/lib/auth";
import {
  IconBriefcase,
  IconScale,
  IconClock,
  IconChat,
  IconDocLines,
  IconCard,
  IconTrendingUp,
  IconEye,
  IconMapPin,
} from "@/components/icons";

type SvgC = (p: { className?: string }) => ReactNode;
type Tile = { key: string; from: "workload" | "finance"; label: string; Icon: SvgC; money?: boolean };

// «Bugun» — counts pulled from the workload block. courts_today /
// documents_to_review are optional backend keys (fall back to 0 until the
// backend ships them — see LEXGO_SELLER_DASHBOARD_BACKEND_UPDATE).
const TODAY: Tile[] = [
  { key: "active_cases", from: "workload", label: "activeCases", Icon: IconBriefcase },
  { key: "courts_today", from: "workload", label: "courtsToday", Icon: IconScale },
  { key: "deadlines_today", from: "workload", label: "deadlines", Icon: IconClock },
  { key: "unread_messages", from: "workload", label: "newMessages", Icon: IconChat },
  { key: "documents_to_review", from: "workload", label: "docsToReview", Icon: IconDocLines },
];
// «Moliyaviy holat» — sums from the finance block (earnings_today,
// earnings_via_lexgo, payable are optional keys, 0 until backend ships them).
const FINANCE: Tile[] = [
  { key: "earnings_today", from: "finance", label: "incomeToday", Icon: IconCard, money: true },
  { key: "earnings_month", from: "finance", label: "incomeMonth", Icon: IconTrendingUp, money: true },
  { key: "pending_payout", from: "finance", label: "expected", Icon: IconClock, money: true },
  { key: "earnings_via_lexgo", from: "finance", label: "viaLexgo", Icon: IconBriefcase, money: true },
  { key: "payable", from: "finance", label: "payable", Icon: IconCard, money: true },
];

const num = (o: Record<string, unknown> | undefined, k: string): number => {
  const x = o?.[k];
  const n = typeof x === "number" ? x : parseFloat(String(x));
  return Number.isFinite(n) ? n : 0;
};
const som = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function SellerDashboard({ role }: { role: Role }) {
  const t = useTranslations("portal.sellerDash");
  const tc = useTranslations("portal.common");
  const stats = useResourceOne<SellerStats>(getLawyerStats, []);
  const orders = useResource<BackendOrder>(listOpenOrders, []);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function tiles(list: Tile[]) {
    if (stats.status === "loading") return <Skeleton rows={2} />;
    if (stats.status === "error" || !stats.data) {
      return <EmptyState icon={<IconTrendingUp />} title={tc("loadError")} text={tc("loadErrorText")} />;
    }
    const s = stats.data;
    const cur = String((s.finance?.currency as string) || "UZS");
    return (
      <div className="amet">
        {list.map((m) => {
          const n = num(s[m.from] as Record<string, unknown>, m.key);
          return (
            <div className="amet__c" key={m.key}>
              <span className="amet__i"><m.Icon /></span>
              <b>{m.money ? `${som(n)} ${cur}` : String(n)}</b>
              <span className="amet__l">{t(m.label)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const openCases = orders.data.filter((o) => !dismissed.has(o.id));

  return (
    <>
      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("today")}</b>
          <span className="advmuted">{t("todaySub")}</span>
        </div>
        {tiles(TODAY)}
      </div>

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("finance")}</b>
        </div>
        {tiles(FINANCE)}
      </div>

      <div className="ppanel">
        <div className="ppanel__h">
          <b>{t("newCases")}</b>
          <span className="advmuted">{t("newCasesSub", { n: openCases.length })}</span>
        </div>
        {orders.status === "loading" ? (
          <Skeleton rows={3} />
        ) : !openCases.length ? (
          <EmptyState icon={<IconBriefcase />} title={t("casesEmpty")} text={t("casesEmptyText")} />
        ) : (
          <div className="pcards">
            {openCases.map((o) => (
              <NewCase key={o.id} order={o} role={role} onDone={() => setDismissed((d) => new Set(d).add(o.id))} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function NewCase({ order: o, role, onDone }: { order: BackendOrder; role: Role; onDone: () => void }) {
  const t = useTranslations("portal.sellerDash");
  const [open, setOpen] = useState(false);
  const listHref = role === "advocate" ? "/portal/advocate/opportunities" : "/portal/lawyer/marketplace";
  const meta = [o.region, o.budget].filter(Boolean).join(" · ");
  return (
    <div className="pcase">
      <div className="pcase__h">
        <span className="pcase__id">{o.serviceName || t("newCases")}</span>
        {o.createdAt ? <span className="advmuted"><IconClock style={{ width: 13, height: 13 }} /> {o.createdAt}</span> : null}
      </div>
      {o.title ? <p className={`pcase__q${open ? " on" : ""}`}>{o.title}</p> : null}
      {meta ? <small><IconMapPin />{meta}</small> : null}
      <div className="pcase__row">
        {o.title ? (
          <button type="button" className="btn btn--soft btn--sm" onClick={() => setOpen((v) => !v)}>
            <IconEye />
            {t("review")}
          </button>
        ) : (
          <Link href={listHref} className="btn btn--soft btn--sm">
            <IconEye />
            {t("review")}
          </Link>
        )}
        <OrderActions orderId={o.id} onDone={onDone} />
      </div>
    </div>
  );
}
