"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { getToken } from "@/lib/client";
import {
  getSecureMessages,
  sendSecureMessage,
  secureSocketUrl,
  type SecureMessage,
} from "@/lib/services/backend";
import { IconSend, IconShieldCheck, IconClose, IconAlert } from "../icons";

export default function SecureChat({ roomId }: { roomId: string }) {
  const t = useTranslations("secureChat");
  const { session, ready } = useAuth();
  const router = useRouter();
  const [msgs, setMsgs] = useState<SecureMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const bodyRef = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string>>(new Set());

  function push(list: SecureMessage[]) {
    setMsgs((prev) => {
      const next = [...prev];
      for (const m of list) {
        if (m.id && seen.current.has(m.id)) continue;
        if (m.id) seen.current.add(m.id);
        next.push(m);
      }
      return next;
    });
  }

  useEffect(() => {
    let alive = true;
    getSecureMessages(roomId)
      .then((m) => {
        if (!alive) return;
        m.forEach((x) => x.id && seen.current.add(x.id));
        setMsgs(m);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(secureSocketUrl(roomId, getToken()));
      ws.onmessage = (e) => {
        try {
          const o = JSON.parse(e.data);
          const raw = o.message ?? o;
          const m: SecureMessage = {
            id: String(raw.id ?? ""),
            senderId: String(raw.sender_user_id ?? raw.senderId ?? ""),
            filteredContent: String(raw.filtered_content ?? raw.content ?? ""),
            isBlocked: Boolean(raw.is_blocked),
            blockReason: raw.block_reason ? String(raw.block_reason) : undefined,
            createdAt: String(raw.created_at ?? ""),
          };
          if (m.id) push([m]);
        } catch {
          /* ignore non-JSON frames */
        }
      };
    } catch {
      /* WS unavailable — GET already loaded history */
    }
    return () => {
      alive = false;
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, sending]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setText("");
    setSending(true);
    try {
      const m = await sendSecureMessage(roomId, content);
      push([m]);
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  if (ready && !session) {
    return (
      <div className="schat schat--gate">
        <p>{t("loginRequired")}</p>
        <Link href="/login" className="btn btn--pri">{t("login")}</Link>
      </div>
    );
  }

  return (
    <div className="schat">
      <div className="schat__head">
        <button className="schat__x" type="button" aria-label={t("close")} onClick={() => router.back()}>
          <IconClose />
        </button>
        <span className="schat__i"><IconShieldCheck /></span>
        <div className="schat__t">
          <b>{t("title")}</b>
          <span>{t("secured")}</span>
        </div>
      </div>

      <div className="schat__body" ref={bodyRef}>
        {status === "loading" ? (
          <p className="schat__hint">{t("loading")}</p>
        ) : msgs.length === 0 ? (
          <div className="schat__empty">
            <IconShieldCheck />
            <p>{t("empty")}</p>
          </div>
        ) : (
          msgs.map((m, i) => {
            const mine = !!session && m.senderId === session.id;
            return (
              <div key={m.id || i} className={`sbub sbub--${mine ? "me" : "them"}`}>
                <div className="sbub__c">{m.filteredContent}</div>
                {m.isBlocked ? (
                  <div className="sbub__blocked">
                    <IconAlert />
                    {m.blockReason || t("blocked")}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="schat__note">{t("safetyNote")}</div>

      <div className="schat__bar">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
        />
        <button type="button" onClick={send} disabled={sending || !text.trim()} aria-label={t("send")}>
          <IconSend />
        </button>
      </div>
    </div>
  );
}
