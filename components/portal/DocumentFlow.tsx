"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getDocumentTemplates,
  createDocumentRequest,
  updateDocumentAnswers,
  payDocumentRequest,
  getDocumentRequest,
  type BackendTemplate,
  type DocumentRequest,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import { IconDocLines, IconDownload, IconExternal, IconCheck } from "@/components/icons";

const som = (n?: number) => (n ? n.toLocaleString("ru-RU").replace(/,/g, " ") : "");

function openPdf(f: DocumentRequest["contractFile"], download = false) {
  if (!f) return;
  try {
    const bytes = Uint8Array.from(atob(f.fileBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: f.mimeType || "application/pdf" });
    const url = URL.createObjectURL(blob);
    if (download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = f.fileName || "document.pdf";
      a.click();
    } else {
      window.open(url, "_blank");
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    /* ignore */
  }
}

export default function DocumentFlow() {
  const t = useTranslations("portal.client.documents");
  const tpls = useResource(getDocumentTemplates, []);
  const clientTpls = tpls.data.filter((x) => x.visibility === "client");

  const [req, setReq] = useState<DocumentRequest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"answers" | "pay" | "done">("answers");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  function close() {
    setReq(null);
    setNote(null);
  }

  async function start(tpl: BackendTemplate) {
    setBusy(true);
    setNote(null);
    try {
      const r = await createDocumentRequest({
        template_id: tpl.id,
        document_type: tpl.category || "document",
        title: tpl.name,
        questionnaire: tpl.questionnaire,
        price: tpl.price,
      });
      setReq(r);
      setAnswers({});
      setStage(r.status === "file_ready" ? "done" : "answers");
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  async function saveAnswers() {
    if (!req || busy) return;
    setBusy(true);
    try {
      const r = await updateDocumentAnswers(req.id, answers);
      setReq(r);
      setStage("pay");
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!req || busy) return;
    setBusy(true);
    setNote(null);
    try {
      let r = await payDocumentRequest(req.id, "payme");
      if (r.status !== "file_ready") r = await getDocumentRequest(req.id);
      setReq(r);
      if (r.status === "file_ready") setStage("done");
      else setNote({ ok: false, msg: t("processing") });
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    if (!req) return;
    setBusy(true);
    try {
      const r = await getDocumentRequest(req.id);
      setReq(r);
      if (r.status === "file_ready") {
        setStage("done");
        setNote(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{clientTpls.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {tpls.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !clientTpls.length ? (
        <EmptyState icon={<IconDocLines />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="svsel__grid">
          {clientTpls.map((tpl) => (
            <button key={tpl.id} type="button" className="svcard" onClick={() => start(tpl)} disabled={busy}>
              <span className="svcard__i"><IconDocLines /></span>
              <span className="svcard__t">
                <b>{tpl.name}</b>
                <small>{[tpl.category, tpl.price ? `${som(tpl.price)} ${t("som")}` : t("free")].filter(Boolean).join(" · ")}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!req} onClose={close} title={req?.title || t("title")}>
        {req ? (
          <div className="cform" style={{ maxWidth: "none" }}>
            {stage === "answers" ? (
              <>
                <p className="advmuted">{t("answersLead")}</p>
                {req.questionnaire.length ? (
                  req.questionnaire.map((f) => (
                    <div key={f.name}>
                      <label>{f.label}{f.required ? " *" : ""}</label>
                      <input
                        value={answers[f.name] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [f.name]: e.target.value }))}
                      />
                    </div>
                  ))
                ) : (
                  <p className="advmuted">{t("noFields")}</p>
                )}
                {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
                <button className="btn btn--pri btn--full" type="button" onClick={saveAnswers} disabled={busy}>
                  {busy ? t("saving") : t("continue")}
                </button>
              </>
            ) : null}

            {stage === "pay" ? (
              <>
                <div className="oprice">
                  <span>{t("price")}</span>
                  <b>{req.price ? `${som(req.price)} ${t("som")}` : t("free")}</b>
                </div>
                <p className="advmuted">{t("payLead")}</p>
                {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
                <button className="btn btn--grad btn--full btn--lg" type="button" onClick={pay} disabled={busy}>
                  {busy ? t("processingShort") : t("pay")}
                </button>
                <button className="rf__link rf__link--muted" type="button" onClick={refresh} disabled={busy}>
                  {t("checkStatus")}
                </button>
              </>
            ) : null}

            {stage === "done" && req.contractFile ? (
              <div className="docdone">
                <span className="docdone__i"><IconCheck /></span>
                <b>{t("ready")}</b>
                <span className="docdone__f">{req.contractFile.fileName}</span>
                <div className="docdone__act">
                  <button className="btn btn--pri" type="button" onClick={() => openPdf(req.contractFile)}>
                    <IconExternal />
                    {t("open")}
                  </button>
                  <button className="btn btn--line" type="button" onClick={() => openPdf(req.contractFile, true)}>
                    <IconDownload />
                    {t("download")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
