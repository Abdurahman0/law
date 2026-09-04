"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  listLeads,
  adminCreateLead,
  adminUpdateLead,
  adminDeleteLead,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminForm, useReload } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { IconUsers, IconPlus, IconClose } from "@/components/icons";

const STATUSES = ["new", "in_progress", "converted", "rejected"];

export default function AdminLeads() {
  const t = useTranslations("admin");
  const [key, reload] = useReload();
  const res = useResource(listLeads, [key]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      await adminUpdateLead(id, { status });
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }
  async function remove(id: string) {
    setBusy(id);
    try {
      await adminDeleteLead(id);
      reload();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  }

  const statusOpts = STATUSES.map((s) => ({ value: s, label: t(`leads.status.${s}`) }));

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("leads.title")}</b>
        <span className="ahdr">
          <span className="advmuted">{res.data.length}</span>
          <button className="btn btn--pri btn--sm" type="button" onClick={() => setOpen(true)}>
            <IconPlus />
            {t("form.add")}
          </button>
        </span>
      </div>
      <p className="advmuted" style={{ marginBottom: 16 }}>{t("leads.lead")}</p>

      {res.status === "loading" ? (
        <Skeleton rows={4} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconUsers />} title={t("leads.empty")} text={t("leads.emptyText")} />
      ) : (
        <div className="alist">
          {res.data.map((l, i) => (
            <div className="aitem" key={l.id}>
              <span className="aitem__n">{i + 1}</span>
              <div className="aitem__m">
                <b>{l.name || l.phone || l.category || l.source}</b>
                <span className="aitem__meta">
                  {[l.phone, l.category, l.region, l.note].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div className="aitem__r" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 150 }}>
                  <Select
                    value={STATUSES.includes(l.status) ? l.status : ""}
                    onChange={(v) => setStatus(l.id, v)}
                    options={statusOpts}
                    ariaLabel={t("leads.statusLabel")}
                    placeholder={l.status || t("leads.statusLabel")}
                  />
                </div>
                <button
                  className="amodal__x"
                  type="button"
                  aria-label={t("leads.delete")}
                  disabled={busy === l.id}
                  onClick={() => remove(l.id)}
                >
                  <IconClose />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("leads.create")}>
        <AdminForm
          fields={[
            { name: "name", label: t("leads.name"), required: true },
            { name: "phone", label: t("leads.phone"), required: true, placeholder: "+998 __ ___ __ __" },
            { name: "category", label: t("form.category") },
            { name: "region", label: t("leads.region") },
            { name: "note", label: t("leads.note"), type: "textarea" },
          ]}
          onSubmit={async (v) =>
            void (await adminCreateLead({
              name: String(v.name),
              phone: String(v.phone),
              category: String(v.category),
              region: String(v.region),
              note: String(v.note),
              source: "manual",
            }))
          }
          submitLabel={t("form.save")}
          busyLabel={t("form.saving")}
          okMsg={t("form.created")}
          errMsg={t("form.error")}
          onDone={() => {
            reload();
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
