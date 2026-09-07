"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { askAiAssistant } from "@/lib/services/backend";
import { IconSparkle, IconSend } from "@/components/icons";

const TOOLS = ["draft", "summarize", "precedents", "explain"];

export default function AiAssistant() {
  const t = useTranslations("portal.assistant");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");

  async function ask() {
    const q = prompt.trim();
    if (!q || busy) return;
    setBusy(true);
    setAnswer("");
    try {
      setAnswer(await askAiAssistant(q));
    } catch {
      setAnswer(t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="asist">
      <div className="asist__hero">
        <span className="asist__ico"><IconSparkle /></span>
        <div>
          <h1 className="asist__title">{t("title")}</h1>
          <p className="asist__sub">{t("subtitle")}</p>
        </div>
      </div>

      <div className="chiprow">
        {TOOLS.map((x) => (
          <button key={x} type="button" className="fchip" onClick={() => setPrompt(t(`tool.${x}`))}>
            {t(`tool.${x}`)}
          </button>
        ))}
      </div>

      <div className="ppanel">
        <textarea className="intake__ta" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t("placeholder")} />
        <button className="btn btn--pri btn--full" type="button" onClick={ask} disabled={busy || !prompt.trim()}>
          <IconSend />
          {busy ? t("thinking") : t("ask")}
        </button>
      </div>

      {answer ? (
        <div className="ppanel asist__ans">
          <div className="ppanel__h"><b>{t("answer")}</b></div>
          <p className="asist__text">{answer}</p>
        </div>
      ) : null}
    </div>
  );
}
