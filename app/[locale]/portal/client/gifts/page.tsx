"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  listGifts,
  createGift,
  getSubscriptionPlans,
  getServices,
  type BackendPlan,
  type BackendService,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { IconGift, IconPlus } from "@/components/icons";

function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
}

export default function ClientGifts() {
  const t = useTranslations("portal.client.gifts");
  const [reloadKey, setReloadKey] = useState(0);
  const gifts = useResource(() => listGifts(), [reloadKey]);
  const plans = useResource<BackendPlan>(getSubscriptionPlans, []);
  const services = useResource<BackendService>(() => getServices(), []);
  const giftable = plans.data.filter((p) => p.isGiftable);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"plan" | "service">("plan");
  const [planId, setPlanId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [phone, setPhone] = useState("");
  const [term, setTerm] = useState("6");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const planOpts = (giftable.length ? giftable : plans.data).map((p) => ({ value: p.id, label: p.name }));
  const serviceOpts = services.data.filter((s) => s.isActive).map((s) => ({ value: s.id, label: s.name }));
  const termOpts = ["3", "6", "12"].map((n) => ({ value: n, label: `${n} ${t("months")}` }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const isService = kind === "service";
    const chosen = isService ? serviceId || serviceOpts[0]?.value : planId || planOpts[0]?.value;
    if (busy || !chosen || !phone.trim()) {
      setNote({ ok: false, msg: t("error") });
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const r = await createGift({
        ...(isService ? { service_id: chosen } : { plan_id: chosen, term_months: parseInt(term, 10) }),
        recipient_phone: phone.trim(),
        message: message.trim() || undefined,
      });
      if (r.paymentUrl) window.open(r.paymentUrl, "_blank");
      setNote({ ok: true, msg: t("success") });
      setPhone("");
      setMessage("");
      setReloadKey((k) => k + 1);
      setTimeout(() => setOpen(false), 1000);
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <button className="btn btn--pri btn--sm" type="button" onClick={() => setOpen(true)}>
          <IconPlus />
          {t("give")}
        </button>
      </div>

      {gifts.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !gifts.data.length ? (
        <EmptyState icon={<IconGift />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {gifts.data.map((g) => (
            <div className="creq" key={g.id}>
              <span className="creq__st" />
              <div className="creq__m">
                <b>{g.planName || "—"}</b>
                <span>
                  {[g.recipientPhone, `${g.termMonths} ${t("months")}`, fmtDate(g.createdAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              <span className="creq__badge">{t.has(g.status) ? t(g.status) : g.status}</span>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("give")}>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={submit}>
          <div className="rolerow" style={{ display: "flex" }}>
            <button type="button" className="roletab" aria-pressed={kind === "plan"} onClick={() => setKind("plan")}>
              {t("kindPlan")}
            </button>
            <button type="button" className="roletab" aria-pressed={kind === "service"} onClick={() => setKind("service")}>
              {t("kindService")}
            </button>
          </div>
          {kind === "plan" ? (
            <div>
              <label>{t("plan")}</label>
              <Select
                value={planId || planOpts[0]?.value || ""}
                onChange={setPlanId}
                options={planOpts.length ? planOpts : [{ value: "", label: "—" }]}
                ariaLabel={t("plan")}
              />
            </div>
          ) : (
            <div>
              <label>{t("service")}</label>
              <Select
                value={serviceId || serviceOpts[0]?.value || ""}
                onChange={setServiceId}
                options={serviceOpts.length ? serviceOpts : [{ value: "", label: "—" }]}
                ariaLabel={t("service")}
              />
            </div>
          )}
          <div>
            <label>{t("recipient")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 __ ___ __ __" type="tel" />
          </div>
          {kind === "plan" ? (
            <div>
              <label>{t("term")}</label>
              <Select value={term} onChange={setTerm} options={termOpts} ariaLabel={t("term")} />
            </div>
          ) : null}
          <div>
            <label>{t("message")}</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("messagePh")} rows={2} />
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("sending") : t("send")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
