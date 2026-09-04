"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  listCases,
  createRefundRequest,
  createReplacementRequest,
  listCaseDocuments,
  createCaseDocument,
  type BackendCase,
  type ModuleRecord,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { IconFileText, IconArrowRight, IconDocLines } from "@/components/icons";

export default function ClientCases() {
  const t = useTranslations("portal.client.cases");
  const res = useResource(listCases, []);

  // Refund / replacement request modal
  const [target, setTarget] = useState<BackendCase | null>(null);
  const [kind, setKind] = useState("refund");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  // Case-documents modal
  const [docCase, setDocCase] = useState<BackendCase | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const payload = { case_id: target.id, reason: reason.trim() };
      const title = `${target.caseType || target.caseNumber} — ${kind}`;
      if (kind === "refund") await createRefundRequest({ title, payload });
      else await createReplacementRequest({ title, payload });
      setNote({ ok: true, msg: t("requestSent") });
      setReason("");
      setTimeout(() => setTarget(null), 1200);
    } catch (err) {
      const d = err && typeof err === "object" && "detail" in err ? String((err as { detail?: string }).detail) : "";
      setNote({ ok: false, msg: d || t("requestError") });
    } finally {
      setBusy(false);
    }
  }

  const kindOpts = [
    { value: "refund", label: t("refund") },
    { value: "replacement", label: t("replacement") },
  ];

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{t("count", { n: res.data.length })}</span>
      </div>
      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconFileText />} title={t("empty")} text={t("emptyText")} />
      ) : (
        res.data.map((c) => (
          <div className="creq" key={c.id}>
            <span className="creq__st" />
            <div className="creq__m">
              <b>{c.caseType || c.caseNumber}</b>
              <span>{[c.stage, c.caseNumber].filter(Boolean).join(" · ")}</span>
              {c.nextAction ? (
                <em className="creq__next">
                  <IconArrowRight />
                  {c.nextAction}
                </em>
              ) : null}
            </div>
            <div className="creq__side">
              <span className="creq__badge">{c.status}</span>
              <button className="btn btn--line btn--sm" type="button" onClick={() => setDocCase(c)}>
                {t("docsCta")}
              </button>
              <button
                className="btn btn--line btn--sm"
                type="button"
                onClick={() => {
                  setTarget(c);
                  setKind("refund");
                  setReason("");
                  setNote(null);
                }}
              >
                {t("requestCta")}
              </button>
            </div>
          </div>
        ))
      )}

      <Modal open={!!target} onClose={() => setTarget(null)} title={t("requestTitle")}>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={submit}>
          <p className="advmuted">{t("requestLead")}</p>
          <div>
            <label>{t("requestKind")}</label>
            <Select value={kind} onChange={setKind} options={kindOpts} ariaLabel={t("requestKind")} />
          </div>
          <div>
            <label>{t("requestReason")}</label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("requestReasonPh")} />
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("requestSending") : t("requestSubmit")}
          </button>
          <p className="rf__hint">{t("requestNote")}</p>
        </form>
      </Modal>

      <CaseDocsModal target={docCase} onClose={() => setDocCase(null)} />
    </div>
  );
}

function CaseDocsModal({ target, onClose }: { target: BackendCase | null; onClose: () => void }) {
  const t = useTranslations("portal.client.cases");
  const [reloadKey, setReloadKey] = useState(0);
  const caseId = target?.id ?? "";
  const load = useCallback(async () => {
    if (!caseId) return [] as ModuleRecord[];
    const all = await listCaseDocuments();
    return all.filter((d) => String(d.payload.case_id ?? "") === caseId);
  }, [caseId]);
  const docs = useResource(load, [caseId, reloadKey]);

  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy || !caseId) return;
    setBusy(true);
    setNote(null);
    try {
      await createCaseDocument({ title: title.trim(), payload: { case_id: caseId } });
      setTitle("");
      setNote({ ok: true, msg: t("docsAdded") });
      setReloadKey((k) => k + 1);
    } catch {
      setNote({ ok: false, msg: t("requestError") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!target} onClose={onClose} title={t("docsTitle")}>
      <div className="cform" style={{ maxWidth: "none" }}>
        {docs.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !docs.data.length ? (
          <EmptyState icon={<IconDocLines />} title={t("docsEmpty")} text={t("docsEmptyText")} />
        ) : (
          <div className="alist">
            {docs.data.map((d) => (
              <div className="creq" key={d.id}>
                <span className="creq__st" />
                <div className="creq__m">
                  <b>{d.title}</b>
                  {d.status ? <span>{d.status}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={add} style={{ display: "grid", gap: 8, marginTop: 4 }}>
          <label>{t("docsAdd")}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("docsAddPh")} />
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("requestSending") : t("docsAdd")}
          </button>
        </form>
      </div>
    </Modal>
  );
}
