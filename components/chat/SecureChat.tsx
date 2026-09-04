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
import {
  IconSend,
  IconShieldCheck,
  IconClose,
  IconAlert,
  IconLock,
  IconCheckDouble,
  IconClock,
  IconUser,
} from "../icons";

type LocalMsg = SecureMessage & { pending?: boolean; failed?: boolean };
type Conn = "connecting" | "online" | "offline";

function fmtTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function dayKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toDateString();
}

export default function SecureChat({ roomId }: { roomId: string }) {
  const t = useTranslations("secureChat");
  const { session, ready } = useAuth();
  const router = useRouter();
  const [msgs, setMsgs] = useState<LocalMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [conn, setConn] = useState<Conn>("connecting");
  const bodyRef = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string>>(new Set());

  function push(list: LocalMsg[]) {
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
      ws.onopen = () => alive && setConn("online");
      ws.onclose = () => alive && setConn("offline");
      ws.onerror = () => alive && setConn("offline");
      ws.onmessage = (e) => {
        try {
          const o = JSON.parse(e.data);
          const raw = o.message ?? o;
          const m: LocalMsg = {
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
      setConn("offline");
    }
    return () => {
      alive = false;
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, sending]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setText("");
    setSending(true);
    // Optimistic bubble so the message shows instantly with a "sending" state.
    const tempId = `tmp-${Date.now()}`;
    const optimistic: LocalMsg = {
      id: tempId,
      senderId: session?.id ?? "",
      filteredContent: content,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMsgs((prev) => [...prev, optimistic]);
    try {
      const m = await sendSecureMessage(roomId, content);
      if (m.id) seen.current.add(m.id);
      setMsgs((prev) => prev.map((x) => (x.id === tempId ? { ...m } : x)));
    } catch {
      setMsgs((prev) => prev.map((x) => (x.id === tempId ? { ...x, pending: false, failed: true } : x)));
    } finally {
      setSending(false);
    }
  }

  if (ready && !session) {
    return (
      <div className="schat schat--gate">
        <span className="schat__gicon"><IconLock /></span>
        <p>{t("loginRequired")}</p>
        <Link href="/login" className="btn btn--pri">{t("login")}</Link>
      </div>
    );
  }

  const connLabel = conn === "online" ? t("online") : conn === "connecting" ? t("connecting") : t("offline");

  let lastDay = "";

  return (
    <div className="schat">
      <div className="schat__head">
        <button className="schat__x" type="button" aria-label={t("close")} onClick={() => router.back()}>
          <IconClose />
        </button>
        <span className="schat__i">
          <IconShieldCheck />
          <i className={`schat__pulse schat__pulse--${conn}`} aria-hidden />
        </span>
        <div className="schat__t">
          <b>{t("title")}</b>
          <span className={`schat__conn schat__conn--${conn}`}>
            <i className="schat__cdot" aria-hidden />
            {connLabel}
          </span>
        </div>
        <span className="schat__lock" title={t("secured")}>
          <IconLock />
          {t("e2e")}
        </span>
      </div>

      <div className="schat__body" ref={bodyRef}>
        <div className="schat__sys">
          <IconLock />
          <span>{t("encrypted")}</span>
        </div>

        {status === "loading" ? (
          <div className="schat__load" aria-hidden>
            <span className="sskel sskel--them" />
            <span className="sskel sskel--me" />
            <span className="sskel sskel--them" />
          </div>
        ) : status === "error" ? (
          <div className="schat__empty">
            <span className="schat__halo"><IconAlert /></span>
            <p>{t("errorLoad")}</p>
          </div>
        ) : msgs.length === 0 ? (
          <div className="schat__empty">
            <span className="schat__halo"><IconShieldCheck /></span>
            <p>{t("empty")}</p>
          </div>
        ) : (
          msgs.map((m, i) => {
            const mine = !!session && m.senderId === session.id;
            const dk = dayKey(m.createdAt);
            let sep: React.ReactNode = null;
            if (dk && dk !== lastDay) {
              lastDay = dk;
              const today = new Date().toDateString();
              const yd = new Date(Date.now() - 86400000).toDateString();
              const label = dk === today ? t("today") : dk === yd ? t("yesterday") : new Date(m.createdAt).toLocaleDateString("ru-RU");
              sep = <div className="schat__day" key={`d-${dk}`}><span>{label}</span></div>;
            }
            return (
              <div key={`w-${m.id || i}`}>
                {sep}
                <div className={`sbub sbub--${mine ? "me" : "them"}`}>
                  {!mine ? <span className="sbub__av"><IconUser /></span> : null}
                  <div className="sbub__wrap">
                    <div className={`sbub__c${m.failed ? " sbub__c--failed" : ""}`}>{m.filteredContent}</div>
                    {m.isBlocked ? (
                      <div className="sbub__blocked">
                        <IconAlert />
                        {m.blockReason || t("blocked")}
                      </div>
                    ) : null}
                    <div className="sbub__meta">
                      <span>{fmtTime(m.createdAt)}</span>
                      {mine ? (
                        m.failed ? (
                          <IconAlert className="sbub__rx sbub__rx--fail" />
                        ) : m.pending ? (
                          <IconClock className="sbub__rx" />
                        ) : (
                          <IconCheckDouble className="sbub__rx sbub__rx--ok" />
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {sending ? (
          <div className="sbub sbub--me">
            <div className="sbub__wrap">
              <div className="sbub__typing"><i /><i /><i /></div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="schat__note">
        <IconLock />
        {t("safetyNote")}
      </div>

      <div className="schat__bar">
        <span className="schat__barlock" aria-hidden><IconLock /></span>
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
