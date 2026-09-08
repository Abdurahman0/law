"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { getCallJoinToken, endCall, type LiveKitJoin } from "@/lib/services/backend";
import { playRingback, playEndTone } from "@/lib/callSounds";
import { IconClose, IconMic, IconMicOff, IconVideo, IconUser } from "../icons";

type Props = {
  roomId: string;
  callId: string;
  callType: "audio" | "video";
  isCaller: boolean;
  // Caller already has LiveKit creds from the create-call response; a joiner
  // fetches its own token via /join-token.
  lk?: LiveKitJoin | null;
  onEnd: () => void;
};

// In-app audio/video call over LiveKit (managed SFU + coturn on the backend).
// No external Zoom/Meet — everything stays inside LexGo.
export default function CallRoom({ roomId, callId, callType, isCaller, lk, onEnd }: Props) {
  const t = useTranslations("call");
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<"connecting" | "ringing" | "live" | "ended" | "error">("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "video");
  const [remoteOn, setRemoteOn] = useState(false);

  useEffect(() => {
    let alive = true;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const attach = (track: RemoteTrack) => {
      const c = remoteRef.current;
      if (!c) return;
      const el = track.attach();
      if (track.kind === Track.Kind.Video) el.classList.add("callroom__rvid");
      else el.style.display = "none";
      c.appendChild(el);
      setRemoteOn(true);
      setStatus("live");
    };

    room
      .on(RoomEvent.TrackSubscribed, (track) => attach(track))
      .on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((e) => e.remove()))
      .on(RoomEvent.Disconnected, () => { if (alive) { setStatus("ended"); onEnd(); } });

    (async () => {
      try {
        const creds = lk && lk.token ? lk : await getCallJoinToken(roomId, callId);
        if (!creds.url || !creds.token) { if (alive) setStatus("error"); return; }
        await room.connect(creds.url, creds.token);
        if (!alive) { room.disconnect(); return; }
        await room.localParticipant.setMicrophoneEnabled(true);
        if (callType === "video") {
          await room.localParticipant.setCameraEnabled(true);
          const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (pub?.videoTrack && localRef.current) pub.videoTrack.attach(localRef.current);
        }
        setStatus(room.remoteParticipants.size ? "live" : "ringing");
      } catch {
        if (alive) setStatus("error");
      }
    })();

    return () => {
      alive = false;
      room.disconnect();
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, callId, callType]);

  // Caller hears a ringback until the other side connects.
  useEffect(() => {
    if (!isCaller || status === "live" || remoteOn) return;
    return playRingback();
  }, [isCaller, status, remoteOn]);

  async function toggleMic() {
    const r = roomRef.current;
    if (!r) return;
    const on = !micOn;
    await r.localParticipant.setMicrophoneEnabled(on);
    setMicOn(on);
  }
  async function toggleCam() {
    const r = roomRef.current;
    if (!r) return;
    const on = !camOn;
    await r.localParticipant.setCameraEnabled(on);
    setCamOn(on);
    const pub = r.localParticipant.getTrackPublication(Track.Source.Camera);
    if (on && pub?.videoTrack && localRef.current) pub.videoTrack.attach(localRef.current);
  }
  async function hangUp() {
    playEndTone();
    try {
      await endCall(callId);
    } catch {
      /* ignore */
    }
    roomRef.current?.disconnect();
    onEnd();
  }

  const statusLabel =
    status === "live" ? t("live") : status === "ringing" ? t("ringing") : status === "error" ? t("error") : t("connecting");

  return (
    <div className="callroom">
      <div className="callroom__stage">
        {callType === "video" ? (
          <div ref={remoteRef} className="callroom__remote" />
        ) : (
          <div className="callroom__audio">
            <span className="callroom__avatar"><IconUser /></span>
            <div ref={remoteRef} style={{ display: "none" }} />
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
