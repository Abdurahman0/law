"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getToken } from "@/lib/client";
import { callSocketUrl, endCall } from "@/lib/services/backend";
import { playRingback, playEndTone } from "@/lib/callSounds";
import { IconClose, IconMic, IconMicOff, IconVideo, IconUser } from "../icons";

// STUN alone only works when peers can reach each other directly (same LAN,
// cone NAT). Computer↔phone and mobile-carrier (symmetric) NATs need a TURN
// relay, or the media never connects. Configure a real TURN via env for
// production; fall back to a free public relay so cross-network calls still
// work out of the box.
function buildIce(): RTCConfiguration {
  const servers: RTCIceServer[] = [
    { urls: process.env.NEXT_PUBLIC_STUN_URL || "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl.split(",").map((s) => s.trim()),
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
    });
  } else {
    servers.push({
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    });
  }
  return { iceServers: servers, iceCandidatePoolSize: 4 };
}
const ICE: RTCConfiguration = buildIce();

type Props = {
  roomId: string;
  callId: string;
  callType: "audio" | "video";
  isCaller: boolean;
  myUserId: string;
  onEnd: () => void;
};

// In-app WebRTC call: getUserMedia + RTCPeerConnection, signaling relayed over
// wss://…/ws/secure-chats/{room}/calls/{call}. Google STUN only (add TURN for
// cross-NAT reliability). Two-peer offer/answer with a re-offer on peer join.
export default function CallRoom({ roomId, callId, callType, isCaller, myUserId, onEnd }: Props) {
  const t = useTranslations("call");
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLMediaElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"connecting" | "ringing" | "live" | "ended" | "error">("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "video");
  const [remoteOn, setRemoteOn] = useState(false);

  useEffect(() => {
    let alive = true;
    // ICE candidates that arrive before the remote description is set must be
    // buffered, or addIceCandidate throws and the connection can never form.
    const pending: RTCIceCandidateInit[] = [];
    const flushCandidates = async () => {
      const pc = pcRef.current;
      if (!pc) return;
      while (pending.length) {
        try {
          await pc.addIceCandidate(pending.shift() as RTCIceCandidateInit);
        } catch {
          /* ignore */
        }
      }
    };
    const send = (event: string, payload: Record<string, unknown> = {}) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event, payload }));
    };

    async function makeOffer() {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send("webrtc.offer", { sdp: pc.localDescription });
      } catch {
        /* ignore */
      }
    }

    (async () => {
      // 1) local media
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video" ? { width: 1280, height: 720 } : false,
        });
      } catch {
        if (alive) setStatus("error");
        return;
      }
      if (!alive) {
        stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      // 2) peer connection
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      stream.getTracks().forEach((tr) => pc.addTrack(tr, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate) send("webrtc.ice_candidate", { candidate: e.candidate.toJSON() });
      };
      pc.ontrack = (e) => {
        if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0];
        setRemoteOn(true);
        setStatus("live");
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("live");
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") setStatus("error");
      };

      // 3) signaling socket
      const ws = new WebSocket(callSocketUrl(roomId, callId, getToken()));
      wsRef.current = ws;
      ws.onopen = () => {
        send("call.join", {});
        if (isCaller) makeOffer();
        else setStatus("ringing");
      };
      ws.onmessage = async (ev) => {
        let msg: { event?: string; sender_user_id?: string; payload?: Record<string, unknown> };
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.sender_user_id && msg.sender_user_id === myUserId) return; // ignore own echoes
        const pc2 = pcRef.current;
        if (!pc2) return;
        const payload = msg.payload || {};
        switch (msg.event) {
          case "call.join":
            if (isCaller) makeOffer(); // peer joined → (re)offer
            break;
          case "webrtc.offer":
            try {
              await pc2.setRemoteDescription(new RTCSessionDescription(payload.sdp as RTCSessionDescriptionInit));
              await flushCandidates();
              const answer = await pc2.createAnswer();
              await pc2.setLocalDescription(answer);
              send("webrtc.answer", { sdp: pc2.localDescription });
            } catch {
              /* ignore */
            }
            break;
          case "webrtc.answer":
            try {
              await pc2.setRemoteDescription(new RTCSessionDescription(payload.sdp as RTCSessionDescriptionInit));
              await flushCandidates();
            } catch {
              /* ignore */
            }
            break;
          case "webrtc.ice_candidate":
            if (payload.candidate) {
              if (pc2.remoteDescription && pc2.remoteDescription.type) {
                try {
                  await pc2.addIceCandidate(payload.candidate as RTCIceCandidateInit);
                } catch {
                  /* ignore */
                }
              } else {
                pending.push(payload.candidate as RTCIceCandidateInit);
              }
            }
            break;
          case "call.end":
            playEndTone();
            cleanup();
            setStatus("ended");
            onEnd();
            break;
        }
      };
      ws.onerror = () => alive && setStatus((s) => (s === "live" ? s : "error"));
    })();

    function cleanup() {
      wsRef.current?.close();
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      wsRef.current = null;
      pcRef.current = null;
      streamRef.current = null;
    }

    return () => {
      alive = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, callId, callType, isCaller, myUserId]);

  // Caller hears a ringback tone until the other side connects.
  useEffect(() => {
    if (!isCaller || status === "live" || remoteOn) return;
    const stop = playRingback();
    return stop;
  }, [isCaller, status, remoteOn]);

  function toggleMic() {
    const s = streamRef.current;
    if (!s) return;
    const on = !micOn;
    s.getAudioTracks().forEach((tr) => (tr.enabled = on));
    setMicOn(on);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event: on ? "media.unmute" : "media.mute", payload: { kind: "audio" } }));
  }
  function toggleCam() {
    const s = streamRef.current;
    if (!s) return;
    const on = !camOn;
    s.getVideoTracks().forEach((tr) => (tr.enabled = on));
    setCamOn(on);
  }
  async function hangUp() {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event: "call.end", payload: {} }));
    playEndTone();
    try {
      await endCall(callId);
    } catch {
      /* ignore */
    }
    onEnd();
  }

  const statusLabel =
    status === "live" ? t("live") : status === "ringing" ? t("ringing") : status === "error" ? t("error") : t("connecting");

  return (
    <div className="callroom">
      <div className="callroom__stage">
        {callType === "video" ? (
          <video
            ref={(el) => {
              remoteRef.current = el;
            }}
            className="callroom__remote"
            autoPlay
            playsInline
          />
        ) : (
          <div className="callroom__audio">
            <span className="callroom__avatar"><IconUser /></span>
            <audio
              ref={(el) => {
                remoteRef.current = el;
              }}
              autoPlay
            />
          </div>
        )}
        {!remoteOn ? (
          <div className="callroom__waiting">
            <span className="callroom__pulse" />
            <p>{statusLabel}</p>
          </div>
        ) : null}
        {callType === "video" ? (
          <video ref={localRef} className={`callroom__local${camOn ? "" : " off"}`} autoPlay playsInline muted />
        ) : null}
      </div>

      <div className="callroom__bar">
        <button className={`callroom__btn${micOn ? "" : " off"}`} type="button" onClick={toggleMic} aria-label={t("mic")}>
          {micOn ? <IconMic /> : <IconMicOff />}
        </button>
        {callType === "video" ? (
          <button className={`callroom__btn${camOn ? "" : " off"}`} type="button" onClick={toggleCam} aria-label={t("cam")}>
            <IconVideo />
          </button>
        ) : null}
        <button className="callroom__btn callroom__btn--end" type="button" onClick={hangUp} aria-label={t("end")}>
          <IconClose />
        </button>
      </div>
    </div>
  );
}
