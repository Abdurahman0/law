"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { classifyProblem, type AiClassification } from "@/lib/services/backend";
import { IconSparkle, IconArrowRight, IconAlert } from "@/components/icons";

export default function ClientIntake() {
  const t = useTranslations("portal.client.intake");
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiClassification | null>(null);
  const [failed, setFailed] = useState(false);

  async function analyze() {
    if (busy || text.trim().length < 8) return;
    setBusy(true);
    setFailed(false);
    setResult(null);
    try {
      setResult(await classifyProblem(text.trim()));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="intake">
      <div className="intake__hero">
        <span className="intake__ico"><IconSparkle /></span>
        <div>
          <h1 className="intake__title">{t("title")}</h1>
          <p className="intake__sub">{t("subtitle")}</p>
        </div>
      </div>

      <div className="ppanel">
        <label className="intake__lbl">{t("label")}</label>
        <textarea className="intake__ta" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")} />
        <button className="btn btn--pri btn--full" type="button" onClick={analyze} disabled={busy || text.trim().length < 8}>
          <IconSparkle />
          {busy ? t("analyzing") : t("analyze")}
        </button>
        <p className="intake__hint">{t("hint")}</p>
      </div>

      {result ? (
        <div className="ppanel intake__res">
          <div className="intake__resh">
            <b>{t("resultTitle")}</b>
            <span className={`intake__urg intake__urg--${result.urgency}`}>{t.has(`urgency.${result.urgency}`) ? t(`urgency.${result.urgency}`) : result.urgency}</span>
          </div>
          <div className="intake__kv"><label>{t("category")}</label><b>{result.category || "—"}</b></div>
          {result.summary ? <p className="intake__summary">{result.summary}</p> : null}
          {result.recommendedService ? (
            <div className="intake__kv"><label>{t("recommended")}</label><b>{result.recommendedService}</b></div>
          ) : null}
          <div className="intake__acts">
            <button className="btn btn--pri" type="button" onClick={() => router.push("/portal/client/matches")}>
              {t("toMatches")}
              <IconArrowRight />
            </button>
            <button className="btn btn--soft" type="button" onClick={() => router.push("/portal/client/sos")}>{t("orSos")}</button>
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className="ppanel intake__res">
          <div className="intake__resh"><span className="intake__failicon"><IconAlert /></span><b>{t("failedTitle")}</b></div>
          <p className="intake__summary">{t("failedText")}</p>
          <button className="btn btn--pri" type="button" onClick={() => router.push("/portal/client/sos")}>{t("orSos")}</button>
        </div>
      ) : null}
    </div>
  );
}
