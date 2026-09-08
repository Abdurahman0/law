"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getIdentity,
  identityStart,
  identityVerifyDemo,
  type IdentityProvider,
  type IdentityStatus,
} from "@/lib/services/backend";
import { useResourceOne } from "@/lib/useResource";
import { Skeleton } from "./DataState";
import { Notice } from "@/components/admin/AdminBits";
import { IconShieldCheck } from "@/components/icons";

// OneID / MyID identity verification (demo provider). Start → get a demo code
// → verify. Real credentials can be wired later without changing this flow.
export default function IdentityVerify() {
  const t = useTranslations("portal.client.identity");
  const res = useResourceOne(getIdentity, []);
  const [id, setId] = useState<IdentityStatus | null>(null);
  const cur = id ?? res.data;
  const [prov, setProv] = useState<IdentityProvider | null>(null);
  const [flow, setFlow] = useState<{ state: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function start(p: IdentityProvider) {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setProv(p);
    try {
      const r = await identityStart(p);
      setFlow({ state: r.state });
      setCode(r.demoCode);
    } catch {
      setNote({ ok: false, msg: t("error") });
      setProv(null);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    if (!flow || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await identityVerifyDemo(flow.state, code.trim());
      setId(r);
      if (r.verified) {
        setFlow(null);
        setNote({ ok: true, msg: t("done") });
      } else {
        setNote({ ok: false, msg: t("failed") });
      }
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b></div>
      <p className="ppanel__note">{t("lead")}</p>

      {res.status === "loading" && !id ? (
        <Skeleton rows={2} />
      ) : cur?.verified ? (
        <div className="idv__ok">
          <span className="idv__oki"><IconShieldCheck /></span>
          <div>
            <b>{t("verified")}</b>
            {cur.fullName ? <span>{cur.fullName}{cur.pinfl ? ` · ${cur.pinfl}` : ""}</span> : null}
          </div>
        </div>
      ) : flow ? (
        <div className="idv__flow">
          <p className="advmuted">{t("demoHint", { provider: prov === "myid" ? "MyID" : "OneID" })}</p>
          <div>
            <label>{t("codeLabel")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="button" disabled={busy} onClick={verify}>
            {busy ? t("verifying") : t("verify")}
          </button>
          <button className="rf__link rf__link--muted" type="button" onClick={() => { setFlow(null); setProv(null); setNote(null); }}>
            {t("cancel")}
          </button>
        </div>
      ) : (
        <div className="idv__providers">
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="idv__prov" type="button" disabled={busy} onClick={() => start("oneid")}>
            <b>OneID</b>
            <span>{t("oneidSub")}</span>
          </button>
          <button className="idv__prov" type="button" disabled={busy} onClick={() => start("myid")}>
            <b>MyID</b>
            <span>{t("myidSub")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
