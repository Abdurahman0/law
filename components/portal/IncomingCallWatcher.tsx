"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth";
import { listSecureChats, listCalls, listInvitedCalls, listLawyers } from "@/lib/services/backend";
import { playRingtone } from "@/lib/callSounds";
import CallRoom from "@/components/chat/CallRoom";
import { IconPhone, IconVideo, IconClose } from "@/components/icons";

type Incoming = { kind: "chat" | "meet"; roomId: string; callId: string; callType: "audio" | "video"; callerName: string };

let nameCache: Map<string, string> | null = null;

// Watches for incoming calls anywhere in the portal and rings:
//  • 1:1 calls in the user's secure-chat rooms (accept → open the chat), and
//  • meeting invites from /calls/invited, where the user isn't a room member
//    (accept → join the LiveKit room directly, no chat access needed).
export default function IncomingCallWatcher() {
  const t = useTranslations("call");
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [inc, setInc] = useState<Incoming | null>(null);
  const [meet, setMeet] = useState<Incoming | null>(null); // an accepted meeting rendered inline
  const dismissed = useRef<Set<string>>(new Set());
  const onChatPage = pathname.includes("/portal/chat/");

  useEffect(() => {
    if (!session || meet) {
      if (!session) setInc(null);
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
        // 1) Meeting invites (cross-room) — highest priority.
        const invited = await listInvitedCalls().catch(() => []);
        // Only ring for a still-pending invite — never for someone who already
        // joined, left, declined, or was removed/kicked from the meeting.
        const meetInv = invited.find(
          (c) => c.callStatus === "active" && c.status === "invited" && !dismissed.current.has(c.callId),
        );
        if (meetInv) {
          if (alive) setInc({ kind: "meet", roomId: meetInv.roomId, callId: meetInv.callId, callType: meetInv.callType, callerName: meetInv.callerName || t("someone") });
          return;
        }
        // 2) 1:1 calls in the user's rooms — only when not already inside a chat.
        if (onChatPage) { if (alive) setInc(null); return; }
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
            if (alive) setInc({ kind: "chat", roomId: r.id, callId: fresh.id, callType: fresh.callType === "video" ? "video" : "audio", callerName: name });
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
  }, [session, onChatPage, meet, t]);

  // Ring while an incoming call is pending.
  useEffect(() => {
    if (!inc) return;
    const stop = playRingtone();
    return stop;
  }, [inc]);

  // Resume an active meeting after a page reload (the call is in memory only).
  useEffect(() => {
    if (!session || meet) return;
    let raw: string | null = null;
    try { raw = sessionStorage.getItem("lexgo_active_call"); } catch { raw = null; }
    if (!raw) return;
    let stored: { roomId?: string; callId?: string; callType?: string } | null = null;
    try { stored = JSON.parse(raw); } catch { stored = null; }
    if (!stored?.roomId || !stored?.callId) return;
    let alive = true;
    listInvitedCalls()
      .then((list) => {
        if (!alive) return;
        const c = list.find((x) => x.callId === stored!.callId);
        if (c && c.callStatus === "active" && c.status !== "removed" && c.status !== "left" && c.status !== "declined") {
          setMeet({ kind: "meet", roomId: stored!.roomId!, callId: stored!.callId!, callType: stored!.callType === "audio" ? "audio" : "video", callerName: c.callerName || "" });
        } else {
          try { sessionStorage.removeItem("lexgo_active_call"); } catch { /* ignore */ }
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [session, meet]);

  // An accepted meeting is rendered inline (invitee isn't a chat-room member).
  if (meet) {
    return (
      <CallRoom
        roomId={meet.roomId}
        callId={meet.callId}
        callType={meet.callType}
        isCaller={false}
        onEnd={() => {
          dismissed.current.add(meet.callId);
          setMeet(null);
        }}
      />
    );
  }

  if (!inc) return null;

  function accept() {
    if (!inc) return;
    dismissed.current.add(inc.callId);
    const target = inc;
    setInc(null);
    if (target.kind === "meet") {
      setMeet(target); // render CallRoom inline
    } else {
      router.push(`/portal/chat/${target.roomId}?join=${target.callId}`);
    }
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
          <span>{inc.kind === "meet" ? t("incomingMeet") : inc.callType === "video" ? t("incomingVideo") : t("incomingAudio")}</span>
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
