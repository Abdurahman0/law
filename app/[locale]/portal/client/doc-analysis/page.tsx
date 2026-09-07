"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { analyzeDocument, type DocAnalysis } from "@/lib/services/backend";
import { IconFileText, IconAlert, IconCheck, IconSparkle } from "@/components/icons";

export default function ClientDocAnalysis() {
  const t = useTranslations("portal.client.docAnalysis");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<DocAnalysis | null>(null);
  const [failed, setFailed] = useState(false);

  async function run() {
    if (busy || text.trim().length < 20) return;
    setBusy(true);
    setFailed(false);
    setRes(null);
    try {
      setRes(await analyzeDocument(text.trim()));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="doca">
      <div className="doca__hero">
        <span className="doca__ico"><IconFileText /></span>
        <div>
          <h1 className="doca__title">{t("title")}</h1>
          <p className="doca__sub">{t("subtitle")}</p>
        </div>
      </div>

      <div className="ppanel">
        <label className="intake__lbl">{t("label")}</label>
        <textarea className="intake__ta" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")} />
        <button className="btn btn--pri btn--full" type="button" onClick={run} disabled={busy || text.trim().length < 20}>
          <IconSparkle />
          {busy ? t("analyzing") : t("analyze")}
        </button>
        <p className="intake__hint">{t("hint")}</p>
      </div>

      {res ? (
        <>
          <div className="ppanel">
            <div className="ppanel__h"><b>{t("summary")}</b></div>
            <p className="doca__summary">{res.summary || t("noSummary")}</p>
          </div>
          <div className="ppanel">
            <div className="ppanel__h"><b>{t("risks")}</b></div>
            {res.risks.length ? (
              <div className="doca__risks">
                {res.risks.map((r, i) => (
                  <div className={`doca__risk doca__risk--${r.level}`} key={i}>
                    <span className="doca__rl">{t.has(`level.${r.level}`) ? t(`level.${r.level}`) : r.level}</span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            ) : <p className="advmuted">{t("noRisks")}</p>}
          </div>
          {res.recommendations.length ? (
            <div className="ppanel">
              <div className="ppanel__h"><b>{t("recommendations")}</b></div>
              <ul className="doca__recs">
                {res.recommendations.map((r, i) => (
                  <li key={i}><IconCheck />{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      {failed ? (
        <div className="ppanel">
          <div className="ppanel__h"><span className="intake__failicon"><IconAlert /></span><b>{t("failedTitle")}</b></div>
          <p className="advmuted">{t("failedText")}</p>
        </div>
      ) : null}
    </div>
  );
}
