"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/services/backend";
import { Skeleton, EmptyState } from "./DataState";
import { IconChat, IconCheckDouble } from "@/components/icons";

// Fired whenever notifications are read so the header bell can refresh its
// unread count without a full reload.
export const NOTIF_READ_EVENT = "lexgo:notif-read";
function announceRead() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTIF_READ_EVENT));
}

function fmt(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPanel() {
  const t = useTranslations("portal.notifications");
  const [items, setItems] = useState<Notification[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    listNotifications()
      .then((d) => alive && (setItems(d), setStatus("ready")))
      .catch(() => alive && setStatus("error"));
    return () => { alive = false; };
  }, []);

  const hasUnread = items.some((n) => !n.read);

  // Read actions update the list in place — no refetch, so the page doesn't
  // flash/scroll — and notify the bell to refresh its badge.
  async function readOne(n: Notification) {
    if (n.read) return;
    setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    announceRead();
    try {
      await markNotificationRead(n.id);
    } catch {
      /* ignore — optimistic */
    }
  }
  async function readAll() {
    if (!hasUnread) return;
    setItems((list) => list.map((x) => ({ ...x, read: true })));
    announceRead();
    try {
      await markAllNotificationsRead();
    } catch {
      /* ignore — optimistic */
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        {hasUnread ? (
          <button className="btn btn--soft btn--sm" type="button" onClick={readAll}>
            <IconCheckDouble />
            {t("markAll")}
          </button>
        ) : null}
      </div>

      {status === "loading" ? (
        <Skeleton rows={4} />
      ) : !items.length ? (
        <EmptyState icon={<IconChat />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="ntlist">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`ntitem${n.read ? "" : " ntitem--unread"}`}
              onClick={() => readOne(n)}
            >
              <span className="ntitem__dot" aria-hidden />
              <div className="ntitem__m">
                <b>{n.title}</b>
                {n.body ? <span>{n.body}</span> : null}
                <em>{fmt(n.createdAt)}</em>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
