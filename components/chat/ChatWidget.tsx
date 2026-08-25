"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useLexAi } from "./useLexAi";
import { getClientId } from "@/lib/client";
import { createChat, postMessage, type Source } from "@/lib/api";
import { IconSend, IconStar, IconClose, IconArrowRight } from "../icons";

type Msg = {
  role: "a" | "u";
  content: string;
  meta?: string;
  area?: string | null;
  sources?: Source[];
};

export default function ChatWidget({
  variant,
  onClose,
}: {
  variant: "phone" | "dock";
  onClose?: () => void;
}) {
  const t = useTranslations("chat");
  const { reply } = useLexAi();
  const router = useRouter();

  const quick = t.raw("quick") as string[];
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "a", content: t("greeting"), meta: t("greetingNote") },
  ]);
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState("");
  const chatId = useRef<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  function goLawyers(area: string) {
    onClose?.();
    router.push(`/lawyers?area=${encodeURIComponent(area)}`);
  }

  async function ask(raw: string) {
    const content = (raw || "").trim();
    if (typing || !content) return;
    setValue("");
    setMsgs((m) => [...m, { role: "u", content }]);
    setTyping(true);
    try {
      const cid = getClientId();
      let id = chatId.current;
      if (!id) {
        const chat = await createChat(cid, content.slice(0, 48));
        id = chat.id;
        chatId.current = id;
      }
      const { assistant } = await postMessage(cid, id, content);
      setTyping(false);
      setMsgs((m) => [
        ...m,
        { role: "a", content: assistant.content, sources: assistant.sources },
      ]);
    } catch {
      const r = reply(content);
      setTyping(false);
      setMsgs((m) => [
        ...m,
        { role: "a", content: r.text, meta: r.meta, area: r.area },
      ]);
    }
  }

  return (
    <>
      {variant === "phone" ? (
        <div className="phone__hd">
          <b>{t("title")}</b>
          <p>{t("online")}</p>
        </div>
      ) : (
        <div className="dock__h">
          <span className="dock__av">
            <IconStar />
          </span>
          <span className="dock__t">
            <b>{t("title")}</b>
            <span>
              <i />
              {t("online")}
            </span>
          </span>
          <Link
            href="/chat"
            className="dock__x"
            aria-label={t("openFull")}
            onClick={onClose}
            style={{ marginLeft: "auto" }}
          >
            <IconArrowRight style={{ width: 15, height: 15 }} />
          </Link>
          <button
            className="dock__x"
            type="button"
            aria-label={t("closeLabel")}
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>
      )}

      <div className="chat" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            {m.content}
            {m.meta ? <small>{m.meta}</small> : null}
            {m.sources && m.sources.length ? (
              <div className="amsg__sources">
                {m.sources.map((s, j) => (
                  <span key={j} className="asrc">
                    {s.title || s.snippet || s.url}
                  </span>
                ))}
              </div>
            ) : null}
            {m.area ? (
              <button
                className="cact"
                type="button"
                onClick={() => goLawyers(m.area as string)}
              >
                {t("seeLawyer")}
              </button>
            ) : null}
          </div>
        ))}
        {typing ? (
          <div className="typing">
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </div>

      <div className="qr">
        {quick.map((q, i) => (
          <button key={i} type="button" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="cbar">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ask(value);
            }
          }}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputPlaceholder")}
        />
        <button
          type="button"
          onClick={() => ask(value)}
          disabled={typing}
          aria-label={t("title")}
        >
          <IconSend />
        </button>
      </div>
    </>
  );
}
