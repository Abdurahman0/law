"use client";

import { useTranslations } from "next-intl";
import { getDocumentTemplates } from "@/lib/services/backend";
import { createDocumentTemplate } from "@/lib/services/admin";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminForm, useReload } from "@/components/admin/AdminBits";
import { IconDocLines } from "@/components/icons";

const num = (v: string | boolean) => parseInt(String(v || "0"), 10) || 0;

export default function AdminTemplates() {
  const t = useTranslations("admin");
  const [key, reload] = useReload();
  const tpls = useResource(getDocumentTemplates, [key]);

  return (
    <div className="agrid">
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("templates.listTitle")}</b><span className="advmuted">{tpls.data.length}</span></div>
        {tpls.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !tpls.data.length ? (
          <EmptyState icon={<IconDocLines />} title={t("templates.empty")} />
        ) : (
          <div className="alist">
            {tpls.data.map((d) => (
              <div className="arow" key={d.id}>
                <b>{d.name}</b>
                <span>{[d.category, d.language].filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("templates.create")}</b></div>
        <AdminForm
          fields={[
            { name: "title", label: t("form.title"), required: true },
            { name: "slug", label: t("form.slug"), required: true, placeholder: "lease-agreement" },
            { name: "category", label: t("form.category"), placeholder: "contract" },
            { name: "language", label: t("templates.language"), placeholder: "uz" },
            { name: "description", label: t("form.description"), type: "textarea" },
            { name: "template_text", label: t("templates.templateText"), type: "textarea", required: true },
            { name: "price", label: t("form.price"), type: "number", placeholder: "0" },
            { name: "is_active", label: t("form.active"), type: "checkbox" },
          ]}
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
          onDone={reload}
        />
      </div>
    </div>
  );
}
