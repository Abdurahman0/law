"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconSend } from "@/components/icons";

type M = { role: "u" | "a"; text: string };

export default function LawyerChat() {
  const t = useTranslations("portal.lawyer.chat");
  const [msgs, setMsgs] = useState<M[]>([
    { role: "a", text: "Assalomu alaykum, hujjatlarni yubordingizmi?" },
    { role: "u", text: "Ha, shartnoma va tilxatni yukladim." },
  ]);
  const [v, setV] = useState("");

  function send() {
    const text = v.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "u", text }]);
    setV("");
  }

  return (
    <div className="ppanel" style={{ padding: 0, overflow: "hidden" }}>
      <div className="ppanel__h" style={{ padding: "16px 20px", margin: 0 }}>
        <b>{t("title")}</b>
      </div>
      <div className="chat" style={{ height: 380 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="cbar">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t("lead")}
        />
        <button type="button" onClick={send} aria-label="send">
          <IconSend />
        </button>
      </div>
    </div>
  );
}
