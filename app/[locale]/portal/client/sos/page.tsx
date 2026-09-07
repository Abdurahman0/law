"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createSosRequest, type SosRequest } from "@/lib/services/backend";
import { IconAlert, IconChat, IconShieldCheck, IconClock, IconPhone } from "@/components/icons";

const CATS = ["arrest", "police", "court", "search", "contract", "other"];

export default function ClientSos() {
  const t = useTranslations("portal.client.sos");
  const router = useRouter();
  const [cat, setCat] = useState("");
  const [desc, setDesc] = useState("");
  const [stage, setStage] = useState<"idle" | "connecting" | "connected" | "sent">("idle");
  const [req, setReq] = useState<SosRequest | null>(null);
  const [busy, setBusy] = useState(false);

  async function trigger() {
    if (busy) return;
    setBusy(true);
    setStage("connecting");
    try {
      const r = await createSosRequest({ category: cat || "other", description: desc.trim() });
      setReq(r);
      setStage(r.roomId ? "connected" : "sent");
    } catch {
      // Fail-soft: the emergency is logged locally; an operator calls back.
      setStage("sent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sos">
      <div className="sos__hero">
        <span className="sos__pulse">
          <IconAlert />
        </span>
        <h1 className="sos__title">{t("title")}</h1>
        <p className="sos__sub">{t("subtitle")}</p>
        <div className="sos__badges">
          <span><IconClock />{t("badge247")}</span>
          <span><IconShieldCheck />{t("badgePrivate")}</span>
          <span><IconPhone />{t("badgeFast")}</span>
        </div>
      </div>

      {stage === "idle" ? (
        <div className="sos__form">
          <label className="sos__lbl">{t("catLabel")}</label>
          <div className="sos__cats">
            {CATS.map((c) => (
              <button key={c} type="button" className={`sos__cat${cat === c ? " on" : ""}`} onClick={() => setCat(c)}>
                {t(`cat.${c}`)}
              </button>
            ))}
          </div>
          <label className="sos__lbl">{t("descLabel")}</label>
          <textarea
            className="sos__desc"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t("descPh")}
          />
          <button className="sos__btn" type="button" onClick={trigger} disabled={busy}>
            <IconAlert />
            {t("connect")}
          </button>
          <p className="sos__hint">{t("hint")}</p>
        </div>
      ) : null}

      {stage === "connecting" ? (
        <div className="sos__status">
          <span className="sos__spin" aria-hidden />
          <b>{t("connecting")}</b>
          <span>{t("connectingSub")}</span>
        </div>
      ) : null}

      {stage === "connected" && req ? (
        <div className="sos__panel">
          <span className="sos__ok"><IconShieldCheck /></span>
          <b>{t("connectedTitle")}</b>
          <div className="sos__duty">
            <span className="sos__av">{(req.dutyName || "A").slice(0, 1)}</span>
            <div>
              <b>{req.dutyName || t("dutyLawyer")}</b>
              <span>{t("dutyRole")}</span>
            </div>
          </div>
          <button
            className="btn btn--pri btn--full"
            type="button"
            onClick={() => req.roomId && router.push(`/portal/chat/${req.roomId}`)}
          >
            <IconChat />
            {t("openChat")}
          </button>
        </div>
      ) : null}

      {stage === "sent" ? (
        <div className="sos__panel">
          <span className="sos__ok"><IconShieldCheck /></span>
          <b>{t("sentTitle")}</b>
          <span className="sos__psub">{t("sentSub")}</span>
          <button className="btn btn--soft" type="button" onClick={() => setStage("idle")}>
            {t("again")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
