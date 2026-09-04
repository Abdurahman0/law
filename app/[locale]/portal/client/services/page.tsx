"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  getServiceCategories,
  getServices,
  listLawyers,
  demoPurchase,
  type BackendService,
  type BackendLawyer,
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
    listLawyers({ service_id: order.id })
      .then((rows) => setSellers(rows))
      .catch(() => setSellers([]))
      .finally(() => setSellersLoading(false));
  }, [order]);

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
          <div className="oprice">
            <span>{t("price")}</span>
            <b>{order?.price ? `${som(order.price)} ${t("som")}` : t("byRequest")}</b>
          </div>
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
