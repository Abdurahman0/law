"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getDocumentTemplates, type BackendTemplate } from "@/lib/services/backend";
import {
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
} from "@/lib/services/admin";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminForm, AdminItem, Notice, useReload, type Field } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import { IconDocLines, IconPlus, IconSearch, IconEdit, IconTrash } from "@/components/icons";

const som = (n?: number) => (n ? n.toLocaleString("ru-RU").replace(/,/g, " ") : "—");
const num = (v: string | boolean) => parseInt(String(v || "0"), 10) || 0;

export default function AdminTemplates() {
  const t = useTranslations("admin");
  const [key, reload] = useReload();
  const tpls = useResource(getDocumentTemplates, [key]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<BackendTemplate | null>(null);
  const [del, setDel] = useState<BackendTemplate | null>(null);
  const [q, setQ] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delNote, setDelNote] = useState<{ ok: boolean; msg: string } | null>(null);

  // Metadata fields shared by create and edit. The template body (template_text)
  // is only part of create: the list endpoint doesn't return it and there is no
  // single-template GET, so editing metadata must not blank the stored body.
  const metaFields: Field[] = [
    { name: "title", label: t("form.title"), required: true },
    { name: "slug", label: t("form.slug"), required: true, placeholder: "lease-agreement" },
    { name: "category", label: t("form.category"), placeholder: "contract" },
    { name: "language", label: t("templates.language"), placeholder: "uz" },
    { name: "description", label: t("form.description"), type: "textarea" },
    { name: "price", label: t("form.price"), type: "number", placeholder: "0" },
    { name: "is_active", label: t("form.active"), type: "checkbox" },
  ];
  const createFields: Field[] = [
    ...metaFields.slice(0, 5),
    { name: "template_text", label: t("templates.templateText"), type: "textarea", required: true },
    ...metaFields.slice(5),
  ];

  const list = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return tpls.data;
    return tpls.data.filter((d) => {
      const hay = [d.name, d.category, d.slug, d.language].join(" ").toLowerCase();
      return terms.every((w) => hay.includes(w));
    });
  }, [q, tpls.data]);

  async function confirmDelete() {
    if (!del || delBusy) return;
    setDelBusy(true);
    setDelNote(null);
    try {
      await deleteDocumentTemplate(del.id);
      setDel(null);
      reload();
    } catch (e) {
      const detail = e && typeof e === "object" && "detail" in e ? String((e as { detail?: string }).detail) : "";
      setDelNote({ ok: false, msg: detail || t("form.deleteError") });
    } finally {
      setDelBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("templates.listTitle")}</b>
        <span className="ahdr">
          <span className="advmuted">{tpls.data.length}</span>
          <button className="btn btn--pri btn--sm" type="button" onClick={() => setOpen(true)}>
            <IconPlus />
            {t("form.add")}
          </button>
        </span>
      </div>

      <div className="lsp__search" style={{ marginBottom: 14 }}>
        <IconSearch />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("templates.searchPh")} aria-label={t("templates.search")} />
      </div>

      {tpls.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !tpls.data.length ? (
        <EmptyState icon={<IconDocLines />} title={t("templates.empty")} />
      ) : !list.length ? (
        <EmptyState icon={<IconSearch />} title={t("templates.noResults")} />
      ) : (
        <div className="alist">
          {list.map((d, i) => (
            <AdminItem
              key={d.id}
              index={i + 1}
              title={d.name}
              meta={[d.category, d.language, d.slug].filter(Boolean).join(" · ")}
              right={d.price ? som(d.price) : undefined}
              tags={[{ label: d.isActive ? t("form.active") : t("form.inactive"), tone: d.isActive ? "ok" : "muted" }]}
              actions={
                <>
                  <button className="aitem__act" type="button" aria-label={t("form.edit")} title={t("form.edit")} onClick={() => setEdit(d)}>
                    <IconEdit />
                  </button>
                  <button className="aitem__act aitem__act--danger" type="button" aria-label={t("form.delete")} title={t("form.delete")} onClick={() => { setDelNote(null); setDel(d); }}>
                    <IconTrash />
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Create */}
      <Modal open={open} onClose={() => setOpen(false)} title={t("templates.create")}>
        <AdminForm
          fields={createFields}
          onSubmit={async (v) =>
            void (await createDocumentTemplate({
              slug: String(v.slug),
              title: String(v.title),
              category: String(v.category),
              language: String(v.language),
              description: String(v.description),
              template_text: String(v.template_text),
              price: num(v.price),
              is_active: v.is_active as boolean,
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

      {/* Edit (metadata only) */}
      <Modal open={edit !== null} onClose={() => setEdit(null)} title={t("templates.editTitle")}>
        {edit ? (
          <AdminForm
            key={edit.id}
            fields={metaFields}
            initialValues={{
              title: edit.name,
              slug: edit.slug,
              category: edit.category,
              language: edit.language,
              description: edit.description,
              price: edit.price ? String(edit.price) : "",
              is_active: edit.isActive,
            }}
            resetOnDone={false}
            onSubmit={async (v) =>
              void (await updateDocumentTemplate(edit.id, {
                slug: String(v.slug),
                title: String(v.title),
                category: String(v.category),
                language: String(v.language),
                description: String(v.description),
                price: num(v.price),
                is_active: v.is_active as boolean,
              }))
            }
            submitLabel={t("form.update")}
            busyLabel={t("form.saving")}
            okMsg={t("form.updated")}
            errMsg={t("form.updateError")}
            onDone={() => {
              reload();
              setEdit(null);
            }}
          />
        ) : null}
      </Modal>

      {/* Delete confirm */}
      <Modal open={del !== null} onClose={() => setDel(null)} title={t("form.deleteConfirm")}>
        {del ? (
          <div className="cform" style={{ maxWidth: "none" }}>
            <p style={{ margin: 0 }}>
              <b>{del.name}</b>
            </p>
            <p className="advmuted" style={{ margin: 0 }}>{t("form.deleteConfirmText")}</p>
            {delNote ? <Notice ok={delNote.ok} msg={delNote.msg} /> : null}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn--ghost" type="button" onClick={() => setDel(null)}>
                {t("form.cancel")}
              </button>
              <button className="btn btn--danger" type="button" onClick={confirmDelete} disabled={delBusy}>
                {delBusy ? t("form.saving") : t("form.delete")}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
