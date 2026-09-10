"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { listLawyers, createSecureChat, startCall } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import SearchSelect, { type SearchOption } from "@/components/SearchSelect";
import CallRoom from "@/components/chat/CallRoom";
import { Skeleton } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import { IconVideo } from "@/components/icons";

type Active = { roomId: string; callId: string; lk: { url: string; room: string; token: string } | null };

export default function AdminMeetings() {
  const t = useTranslations("admin.meetings");
  const people = useResource(listLawyers, []);
  const [title, setTitle] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<Active | null>(null);

  const options: SearchOption[] = useMemo(
    () =>
      people.data
        .filter((l) => l.userId)
        .map((l) => ({ value: l.userId, label: l.name || "—", sub: l.phone || undefined })),
    [people.data],
  );

  async function start() {
    if (busy) return;
    if (picks.length < 2) {
      setErr(t("needParticipants"));
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      // A meeting lives under a secure-chat room; call-center/admin can open one
      // without payment. Use two picks as the room pair, invite everyone.
      const room = await createSecureChat({ client_user_id: picks[0], seller_user_id: picks[1] });
      const call = await startCall(room.id, "video", title.trim() || t("title"), {
        participantUserIds: picks,
        maxDurationMinutes: 60,
      });
      setActive({
        roomId: room.id,
        callId: call.id,
        lk: call.livekitToken ? { url: call.livekitUrl, room: call.livekitRoom, token: call.livekitToken } : null,
      });
    } catch {
      setErr(t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (active) {
    return (
      <CallRoom
        roomId={active.roomId}
        callId={active.callId}
        callType="video"
        isCaller
        lk={active.lk}
        onEnd={() => {
          setActive(null);
          setPicks([]);
          setTitle("");
        }}
      />
    );
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("subtitle")}</p>

      {people.status === "loading" ? (
        <Skeleton rows={3} />
      ) : (
        <div className="cform" style={{ maxWidth: 560 }}>
          <div>
            <label>{t("titleLabel")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePh")} />
          </div>
          <div>
            <label>{t("participants")}</label>
            <SearchSelect
              value={picks}
              onChange={setPicks}
              options={options}
              placeholder={t("participantsPh")}
              searchPlaceholder={t("participantsSearch")}
              emptyText={t("participantsEmpty")}
              ariaLabel={t("participants")}
            />
          </div>
          <p className="advmuted" style={{ fontSize: ".82rem", margin: 0 }}>{t("hint")}</p>
          {err ? <Notice ok={false} msg={err} /> : null}
          <button className="btn btn--pri" type="button" onClick={start} disabled={busy}>
            <IconVideo />
            {busy ? t("starting") : t("start")}
          </button>
        </div>
      )}
    </div>
  );
}
