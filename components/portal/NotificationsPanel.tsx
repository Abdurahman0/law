"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { IconChat, IconCheckDouble } from "@/components/icons";

function fmt(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPanel() {
  const t = useTranslations("portal.notifications");
  const [reloadKey, setReloadKey] = useState(0);
  const res = useResource<Notification>(listNotifications, [reloadKey]);
  const reload = () => setReloadKey((k) => k + 1);
  const hasUnread = res.data.some((n) => !n.read);

  async function readOne(n: Notification) {
    if (n.read) return;
    try {
      await markNotificationRead(n.id);
      reload();
    } catch {
      /* ignore */
    }
  }
  async function readAll() {
    try {
      await markAllNotificationsRead();
      reload();
    } catch {
      /* ignore */
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

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconChat />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="ntlist">
          {res.data.map((n) => (
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
