"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import {
  getCallJoinToken,
  getCall,
  endCall,
  endMeeting,
  leaveCall,
  inviteCallParticipant,
  listLawyers,
  type LiveKitJoin,
  type BackendLawyer,
} from "@/lib/services/backend";
import Select from "@/components/Select";
import { playRingback, playEndTone } from "@/lib/callSounds";
import { IconClose, IconMic, IconMicOff, IconVideo, IconUser, IconUserPlus } from "../icons";

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
  const [count, setCount] = useState(1); // participants incl. self
  const [remaining, setRemaining] = useState<number | null>(null);

  // Invite (host only): pull another user into the meeting.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [people, setPeople] = useState<BackendLawyer[]>([]);
  const [pick, setPick] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // adaptiveStream pauses video when the element size can't be measured — that
    // showed up as a "frozen" remote picture. Keep it off for these small rooms.
    const room = new Room();
    roomRef.current = room;

    const attach = (track: RemoteTrack) => {
      const c = remoteRef.current;
      if (!c) return;
      const el = track.attach();
      if (track.kind === Track.Kind.Video) {
        el.classList.add("callroom__rvid");
        (el as HTMLVideoElement).autoplay = true;
        (el as HTMLVideoElement).playsInline = true;
        el.setAttribute("playsinline", "");
      } else {
        el.style.display = "none";
        (el as HTMLAudioElement).autoplay = true;
      }
      c.appendChild(el);
      setRemoteOn(true);
      setStatus("live");
    };

    const attachLocalCam = () => {
      const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      const vt = pub?.videoTrack;
      if (vt && localRef.current) vt.attach(localRef.current);
    };

    const syncCount = () => { if (alive) setCount(1 + room.remoteParticipants.size); };
    room
      .on(RoomEvent.TrackSubscribed, (track) => attach(track))
      .on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((e) => e.remove()))
      .on(RoomEvent.ParticipantConnected, syncCount)
      .on(RoomEvent.ParticipantDisconnected, syncCount)
      .on(RoomEvent.LocalTrackPublished, (pub) => {
        if (pub.source === Track.Source.Camera && pub.videoTrack && localRef.current) {
          pub.videoTrack.attach(localRef.current);
        }
      })
      .on(RoomEvent.Disconnected, () => { if (alive) { setStatus("ended"); onEnd(); } });

    (async () => {
      try {
        const creds = lk && lk.token ? lk : await getCallJoinToken(roomId, callId);
        if (!creds.url || !creds.token) { if (alive) setStatus("error"); return; }
        await room.connect(creds.url, creds.token);
        if (!alive) { room.disconnect(); return; }
        // Mic and camera are enabled independently so a denied camera (or no
        // webcam) still leaves a working audio call instead of erroring out.
        try { await room.localParticipant.setMicrophoneEnabled(true); } catch { /* mic denied */ }
        if (callType === "video") {
          try {
            const camPub = await room.localParticipant.setCameraEnabled(true);
            const vt = camPub?.videoTrack;
            if (vt && localRef.current) vt.attach(localRef.current);
            else setTimeout(() => { if (alive) attachLocalCam(); }, 400);
          } catch {
            if (alive) setCamOn(false);
          }
        }
        syncCount();
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

  // Meeting duration: fetch remaining seconds once, then tick down.
  useEffect(() => {
    let alive = true;
    getCall(roomId, callId)
      .then((c) => { if (alive && c.remainingSeconds > 0) setRemaining(c.remainingSeconds); })
      .catch(() => {});
    return () => { alive = false; };
  }, [roomId, callId]);
  useEffect(() => {
    if (remaining == null) return;
    const iv = setInterval(() => setRemaining((s) => (s != null && s > 0 ? s - 1 : s)), 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining == null]);

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
    try {
      const pub = await r.localParticipant.setCameraEnabled(on);
      setCamOn(on);
      if (on) {
        const vt = pub?.videoTrack ?? r.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;
        if (vt && localRef.current) vt.attach(localRef.current);
      }
    } catch {
      /* camera unavailable/denied */
    }
  }
  async function openInvite() {
    setInviteOpen(true);
    setInviteMsg(null);
    if (!people.length) {
      try {
        setPeople(await listLawyers());
      } catch {
        /* ignore */
      }
    }
  }
  async function sendInvite() {
    if (!pick || inviteBusy) return;
    setInviteBusy(true);
    setInviteMsg(null);
    try {
      await inviteCallParticipant(roomId, callId, pick);
      setInviteMsg(t("invited"));
      setPick("");
      setTimeout(() => setInviteOpen(false), 900);
    } catch {
      setInviteMsg(t("inviteError"));
    } finally {
      setInviteBusy(false);
    }
  }
  async function hangUp() {
    playEndTone();
    try {
      // Host ends the whole meeting; a participant just leaves it.
      if (isCaller) await endMeeting(roomId, callId).catch(() => endCall(callId));
      else await leaveCall(roomId, callId);
    } catch {
      /* ignore */
    }
    roomRef.current?.disconnect();
    onEnd();
  }

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel =
    status === "live" ? t("live") : status === "ringing" ? t("ringing") : status === "error" ? t("error") : t("connecting");

  return (
    <div className="callroom">
      <div className="callroom__meta">
        <span className="callroom__pcount"><IconUser />{t("participants", { count })}</span>
        {remaining != null ? <span className="callroom__timer">{t("remaining")}: {mmss(remaining)}</span> : null}
      </div>
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
        {isCaller ? (
          <button className="callroom__btn" type="button" onClick={openInvite} aria-label={t("invite")}>
            <IconUserPlus />
          </button>
        ) : null}
        <button className="callroom__btn callroom__btn--end" type="button" onClick={hangUp} aria-label={t("end")}>
          <IconClose />
        </button>
      </div>

      {inviteOpen ? (
        <div className="callroom__invite" onClick={() => setInviteOpen(false)}>
          <div className="callroom__invitec" onClick={(e) => e.stopPropagation()}>
            <div className="callroom__invhead">
              <b>{t("inviteTitle")}</b>
              <button type="button" className="callroom__ix" onClick={() => setInviteOpen(false)} aria-label={t("cancel")}><IconClose /></button>
            </div>
            <Select
              value={pick}
              onChange={setPick}
              ariaLabel={t("invitePick")}
              placeholder={t("invitePick")}
              options={people.filter((p) => p.userId).map((p) => ({ value: p.userId, label: `${p.name || "—"}${p.phone ? ` · ${p.phone}` : ""}` }))}
            />
            {inviteMsg ? <p className="callroom__invmsg">{inviteMsg}</p> : null}
            <button className="btn btn--pri btn--full" type="button" onClick={sendInvite} disabled={inviteBusy || !pick}>
              {inviteBusy ? t("inviteSending") : t("inviteSend")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
