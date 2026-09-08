"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  getServiceCategories,
  getServices,
  listLawyers,
  demoPurchase,
  getPricingQuote,
  type BackendService,
  type BackendLawyer,
  type PriceQuote,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { Notice } from "@/components/admin/AdminBits";
import { IconBriefcase, IconSearch, IconArrowRight } from "@/components/icons";

const som = (n?: number) => (n ? n.toLocaleString("ru-RU").replace(/,/g, " ") : "");

export default function ClientServices() {
  const t = useTranslations("portal.client.services");
  const locale = useLocale();
  const router = useRouter();
  const cats = useResource(getServiceCategories, []);
  const services = useResource<BackendService>(() => getServices({ catalog_only: true }, locale), [locale]);

  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");

  // order modal
  const [order, setOrder] = useState<BackendService | null>(null);
  const [sellers, setSellers] = useState<BackendLawyer[]>([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellerId, setSellerId] = useState("");
  const [buying, setBuying] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return services.data.filter(
      (s) =>
        (!cat || s.categoryId === cat) &&
        (!query || s.name.toLowerCase().includes(query) || (s.catalogCode || "").toLowerCase().includes(query)),
    );
  }, [services.data, cat, q]);

  useEffect(() => {
    if (!order) return;
    setSellersLoading(true);
    setSellerId("");
    setNote(null);
    setQuote(null);
    listLawyers({ service_id: order.id })
      .then((rows) => setSellers(rows))
      .catch(() => setSellers([]))
      .finally(() => setSellersLoading(false));
  }, [order]);

  // Final price depends on the chosen seller (experience, super-advokat,
  // region) + any referral discount — ask the backend for the live quote.
  useEffect(() => {
    if (!order || !sellerId) {
      setQuote(null);
      return;
    }
    let alive = true;
    setQuoteLoading(true);
    getPricingQuote({ service_id: order.id, lawyer_user_id: sellerId })
      .then((qr) => alive && setQuote(qr))
      .catch(() => alive && setQuote(null))
      .finally(() => alive && setQuoteLoading(false));
    return () => {
      alive = false;
    };
  }, [order, sellerId]);

  async function buy() {
    if (!order || !sellerId || buying) return;
    setBuying(true);
    setNote(null);
    try {
      const r = await demoPurchase({ service_id: order.id, lawyer_user_id: sellerId });
      setBuying(false);
      setOrder(null);
      if (r.chatRoomId) router.push(`/portal/chat/${r.chatRoomId}`);
      else if (r.paymentUrl) window.open(r.paymentUrl, "_blank");
      else router.push("/portal/client/cases");
    } catch {
      setBuying(false);
      setNote({ ok: false, msg: t("orderError") });
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{list.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 14 }}>{t("lead")}</p>

      <div className="svsel__bar" style={{ marginBottom: 14 }}>
        <span className="svsel__search">
          <IconSearch />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} aria-label={t("search")} />
        </span>
      </div>

      <div className="chiprow" style={{ marginBottom: 16 }}>
        <button className="fchip" aria-pressed={cat === ""} onClick={() => setCat("")}>{t("all")}</button>
        {cats.data.map((c) => (
          <button key={c.id} className="fchip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {services.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !list.length ? (
        <EmptyState icon={<IconBriefcase />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="svsel__grid">
          {list.map((s) => (
            <button key={s.id} type="button" className="svcard" onClick={() => setOrder(s)}>
              <span className="svcard__i"><IconBriefcase /></span>
              <span className="svcard__t">
                <b>{s.name}</b>
                <small>
                  {[s.catalogCode, s.price ? `${som(s.price)} ${t("som")}` : t("byRequest")].filter(Boolean).join(" · ")}
                </small>
              </span>
              <span className="svcard__c"><IconArrowRight /></span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!order} onClose={() => setOrder(null)} title={order?.name || t("orderTitle")}>
        <div className="cform" style={{ maxWidth: "none" }}>
          {quote ? (
            <div className="oquote">
              {quote.baseAmount && quote.baseAmount !== quote.totalAmount ? (
                <div className="oquote__row"><span>{t("priceBase")}</span><span>{som(quote.baseAmount)} {t("som")}</span></div>
              ) : null}
              {quote.modifiers.map((m, i) => (
                <div className="oquote__row oquote__row--mod" key={i}>
                  <span>{m.label || m.key}</span>
                  <span>{m.percent ? `${m.percent > 0 ? "+" : ""}${m.percent}%` : m.amount ? `${som(m.amount)} ${t("som")}` : ""}</span>
                </div>
              ))}
              {quote.referralDiscountPercent ? (
                <div className="oquote__row oquote__row--disc">
                  <span>{t("referralDiscount")}</span><span>−{quote.referralDiscountPercent}%</span>
                </div>
              ) : null}
              <div className="oquote__row oquote__row--total">
                <span>{t("priceTotal")}</span>
                <b>{som(quote.totalAmount)} {t("som")}</b>
              </div>
            </div>
          ) : (
            <div className="oprice">
              <span>{t("price")}</span>
              <b>{quoteLoading ? t("priceCalc") : order?.price ? `${som(order.price)} ${t("som")}` : t("byRequest")}</b>
            </div>
          )}
          <div>
            <label>{t("seller")}</label>
            {sellersLoading ? (
              <Skeleton rows={1} />
            ) : sellers.length ? (
              <Select
                value={sellerId}
                onChange={setSellerId}
                options={sellers.filter((l) => l.userId).map((l) => ({
                  value: l.userId,
                  label: `${l.name || "—"}${l.phone ? ` · ${l.phone}` : ""}`,
                }))}
                ariaLabel={t("seller")}
                placeholder={t("selectSeller")}
              />
            ) : (
              <p className="advmuted">{t("noSellers")}</p>
            )}
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--grad btn--full btn--lg" type="button" disabled={!sellerId || buying} onClick={buy}>
            {buying ? t("buying") : t("buy")}
          </button>
          <p className="rf__hint">{t("orderNote")}</p>
        </div>
      </Modal>
    </div>
  );
}
