"use client";

import { useTranslations } from "next-intl";
import { createNotification } from "@/lib/services/admin";
import { AdminForm } from "@/components/admin/AdminBits";

export default function AdminNotifications() {
  const t = useTranslations("admin");

  return (
    <div className="ppanel" style={{ maxWidth: 640 }}>
      <div className="ppanel__h"><b>{t("notifications.title")}</b></div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("notifications.lead")}</p>
      <AdminForm
        fields={[
          { name: "user_id", label: t("notifications.userId"), required: true, placeholder: "user uuid" },
          {
            name: "channel",
            label: t("notifications.channel"),
            type: "select",
            options: [
              { value: "push", label: t("notifications.push") },
              { value: "sms", label: t("notifications.sms") },
            ],
          },
          { name: "title", label: t("form.title"), required: true },
          { name: "body", label: t("notifications.body"), type: "textarea", required: true },
        ]}
        onSubmit={async (v) =>
          void (await createNotification({
            user_id: String(v.user_id),
            channel: String(v.channel || "push"),
            title: String(v.title),
            body: String(v.body),
          }))
        }
        submitLabel={t("notifications.send")}
        busyLabel={t("notifications.sending")}
        okMsg={t("notifications.sent")}
        errMsg={t("form.error")}
      />
    </div>
  );
}
