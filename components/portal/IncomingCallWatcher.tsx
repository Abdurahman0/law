"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { listSecureChats, listCalls, listLawyers } from "@/lib/services/backend";
import { playRingtone } from "@/lib/callSounds";
import { IconPhone, IconVideo, IconClose } from "@/components/icons";

type Incoming = { roomId: string; callId: string; callType: "audio" | "video"; callerName: string };

let nameCache: Map<string, string> | null = null;

// Watches every secure-chat room the user is in for a fresh call another
// participant started, and rings anywhere in the portal — so a call reaches
// the user even when they aren't inside that chat.
export default function IncomingCallWatcher() {
  const t = useTranslations("call");
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [inc, setInc] = useState<Incoming | null>(null);
  const dismissed = useRef<Set<string>>(new Set());
  const onChatPage = pathname.includes("/portal/chat/");

  useEffect(() => {
    if (!session || onChatPage) {
      setInc(null);
      return;
    }
    let alive = true;
    async function names() {
      if (!nameCache) {
        try {
          const ls = await listLawyers();
          nameCache = new Map(ls.map((l) => [l.userId, l.name]));
        } catch {
          nameCache = new Map();
        }
      }
      return nameCache;
    }
    async function poll() {
      try {
        const rooms = (await listSecureChats()).slice(0, 15);
        const nm = await names();
        for (const r of rooms) {
          const calls = await listCalls(r.id).catch(() => []);
          const fresh = calls.find(
            (c) =>
              (c.status === "active" || c.status === "ringing") &&
              c.callerUserId &&
              c.callerUserId !== session!.id &&
              !dismissed.current.has(c.id) &&
              c.startedAt &&
              Date.now() - new Date(c.startedAt).getTime() < 60000,
          );
          if (fresh) {
            const name = nm.get(fresh.callerUserId) || t("someone");
            if (alive) setInc({ roomId: r.id, callId: fresh.id, callType: fresh.callType === "video" ? "video" : "audio", callerName: name });
            return;
          }
        }
        if (alive) setInc(null);
      } catch {
        /* ignore */
      }
    }
    poll();
    const iv = setInterval(poll, 6000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [session, onChatPage, t]);

  // Ring while an incoming call is pending.
  useEffect(() => {
    if (!inc) return;
    const stop = playRingtone();
    return stop;
  }, [inc]);

  if (!inc) return null;

  function accept() {
    if (!inc) return;
    dismissed.current.add(inc.callId);
    const target = inc;
    setInc(null);
    router.push(`/portal/chat/${target.roomId}?join=${target.callId}`);
  }
  function decline() {
    if (!inc) return;
    dismissed.current.add(inc.callId);
    setInc(null);
  }

  return (
    <div className="incall">
      <div className="incall__card">
        <span className="incall__av">
          {inc.callType === "video" ? <IconVideo /> : <IconPhone />}
        </span>
        <div className="incall__m">
          <b>{inc.callerName}</b>
          <span>{inc.callType === "video" ? t("incomingVideo") : t("incomingAudio")}</span>
        </div>
        <div className="incall__act">
          <button className="incall__btn incall__btn--decline" type="button" onClick={decline} aria-label={t("decline")}>
            <IconClose />
          </button>
          <button className="incall__btn incall__btn--accept" type="button" onClick={accept} aria-label={t("accept")}>
            <IconPhone />
          </button>
        </div>
      </div>
    </div>
  );
}
