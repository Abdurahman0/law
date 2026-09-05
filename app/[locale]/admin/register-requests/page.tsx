"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  listRegisterRequests,
  acceptRegisterRequest,
  rejectRegisterRequest,
  type RegisterRequest,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminItem, useReload } from "@/components/admin/AdminBits";
import { IconUser, IconCheck, IconClose } from "@/components/icons";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const fmtDate = (v: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("ru-RU");
};

function Actions({ id, onDone }: { id: string; onDone: () => void }) {
  const t = useTranslations("admin.registerRequests");
  const [busy, setBusy] = useState<null | "accept" | "reject">(null);
  const [done, setDone] = useState<null | "accept" | "reject">(null);
  async function run(kind: "accept" | "reject") {
    if (busy || done) return;
    setBusy(kind);
    try {
      if (kind === "accept") await acceptRegisterRequest(id);
      else await rejectRegisterRequest(id);
      setDone(kind);
      onDone();
    } catch {
      setBusy(null);
    }
  }
  if (done) {
    return (
      <span className={`pcase__done pcase__done--${done === "accept" ? "accept" : "decline"}`}>
        {done === "accept" ? <IconCheck /> : <IconClose />}
        {done === "accept" ? t("accepted") : t("rejected")}
      </span>
    );
  }
  return (
    <div className="pcase__act">
      <button className="btn btn--pri btn--sm" type="button" disabled={!!busy} onClick={() => run("accept")}>
        <IconCheck />
        {busy === "accept" ? t("accepting") : t("accept")}
      </button>
      <button className="btn btn--line btn--sm" type="button" disabled={!!busy} onClick={() => run("reject")}>
        {busy === "reject" ? t("rejecting") : t("reject")}
      </button>
    </div>
  );
}

export default function AdminRegisterRequests() {
  const t = useTranslations("admin.registerRequests");
  const [key, reload] = useReload();
  const res = useResource(() => listRegisterRequests("pending"), [key]);

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <span className="advmuted">{res.data.length}</span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconUser />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((r: RegisterRequest, i) => (
            <AdminItem
              key={r.id || i}
              index={i + 1}
              title={r.name || "—"}
              meta={[cap(r.role), r.phone, fmtDate(r.createdAt)].filter(Boolean).join(" · ")}
              tags={[{ label: r.status || "pending", tone: "muted" }]}
              right={<Actions id={r.id} onDone={reload} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
