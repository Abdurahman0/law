"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { listAdminReviews, moderateReview } from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { useReload, Notice } from "@/components/admin/AdminBits";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { ApiError } from "@/lib/http";
import { IconStar, IconCheck, IconClose } from "@/components/icons";

function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`stars__s${i <= n ? " on" : ""}`}><IconStar /></span>
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const t = useTranslations("admin.reviews");
  const [key, reload] = useReload();
  const res = useResource(() => listAdminReviews(), [key]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function moderate(id: string, status: string) {
    setBusy(id);
    setErr(null);
    try {
      await moderateReview(id, status);
      reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.detail || t("error") : t("error"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h"><b>{t("title")}</b><span className="advmuted">{res.data.length}</span></div>
      <p className="ppanel__note">{t("lead")}</p>
      {err ? <Notice ok={false} msg={err} /> : null}
      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconStar />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((r) => (
            <div className="rvw" key={r.id}>
              <div className="rvw__top">
                <b>{r.lawyerName || "—"}</b>
                <Stars n={r.rating} />
                <span className={`creq__badge rvw__st rvw__st--${r.status}`}>{t.has(`status.${r.status}`) ? t(`status.${r.status}`) : r.status}</span>
              </div>
              {r.comment ? <p className="rvw__c">{r.comment}</p> : null}
              {r.status === "pending" ? (
                <div className="rvw__acts">
                  <button className="btn btn--pri btn--sm" type="button" disabled={busy === r.id} onClick={() => moderate(r.id, "approved")}><IconCheck />{t("approve")}</button>
                  <button className="btn btn--line btn--sm" type="button" disabled={busy === r.id} onClick={() => moderate(r.id, "rejected")}><IconClose />{t("reject")}</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
