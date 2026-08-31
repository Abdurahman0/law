"use client";

import { useTranslations } from "next-intl";
import {
  getServiceCategories,
  getServices,
} from "@/lib/services/backend";
import { createServiceCategory, createService } from "@/lib/services/admin";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminForm, AdminItem, useReload } from "@/components/admin/AdminBits";
import { IconBriefcase } from "@/components/icons";

function num(v: string | boolean): number {
  const n = parseInt(String(v || "0"), 10);
  return Number.isFinite(n) ? n : 0;
}
const som = (n?: number) => (n ? n.toLocaleString("ru-RU").replace(/,/g, " ") : "—");

export default function AdminServices() {
  const t = useTranslations("admin");
  const [catKey, reloadCats] = useReload();
  const [svcKey, reloadSvcs] = useReload();
  const cats = useResource(getServiceCategories, [catKey]);
  const svcs = useResource(getServices, [svcKey]);

  return (
    <div className="agrid">
      {/* Categories */}
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("services.catTitle")}</b><span className="advmuted">{cats.data.length}</span></div>
        {cats.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !cats.data.length ? (
          <EmptyState icon={<IconBriefcase />} title={t("services.catEmpty")} />
        ) : (
          <div className="alist">
            {cats.data.map((c, i) => (
              <AdminItem key={c.id} index={i + 1} title={c.name} meta={c.slug} />
            ))}
          </div>
        )}
        <h3 className="afh">{t("services.catCreate")}</h3>
        <AdminForm
          fields={[
            { name: "title", label: t("form.title"), required: true },
            { name: "slug", label: t("form.slug"), required: true, placeholder: "criminal" },
            { name: "description", label: t("form.description"), type: "textarea" },
          ]}
          onSubmit={async (v) =>
            void (await createServiceCategory({
              slug: String(v.slug),
              title: String(v.title),
              description: String(v.description),
            }))
          }
          submitLabel={t("form.save")}
          busyLabel={t("form.saving")}
          okMsg={t("form.created")}
          errMsg={t("form.error")}
          onDone={reloadCats}
        />
      </div>

      {/* Services */}
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("services.svcTitle")}</b><span className="advmuted">{svcs.data.length}</span></div>
        {svcs.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !svcs.data.length ? (
          <EmptyState icon={<IconBriefcase />} title={t("services.svcEmpty")} />
        ) : (
          <div className="alist">
            {svcs.data.map((s, i) => (
              <AdminItem
                key={s.id}
                index={i + 1}
                title={s.name}
                meta={[s.categoryTitle, s.slug].filter(Boolean).join(" · ")}
                right={som(s.price)}
                tags={[{ label: s.isActive ? t("form.active") : t("form.inactive"), tone: s.isActive ? "ok" : "muted" }]}
              />
            ))}
          </div>
        )}
        <h3 className="afh">{t("services.svcCreate")}</h3>
        <AdminForm
          fields={[
            {
              name: "category_id",
              label: t("form.category"),
              type: "select",
              required: true,
              placeholder: t("form.selectCategory"),
              options: cats.data.map((c) => ({ value: c.id, label: c.name })),
            },
            { name: "title", label: t("form.title"), required: true },
            { name: "slug", label: t("form.slug"), required: true },
            { name: "description", label: t("form.description"), type: "textarea" },
            { name: "base_price", label: t("form.basePrice"), type: "number", placeholder: "150000" },
            { name: "delivery_minutes", label: t("form.deliveryMinutes"), type: "number", placeholder: "60" },
            { name: "is_active", label: t("form.active"), type: "checkbox" },
          ]}
          onSubmit={async (v) =>
            void (await createService({
              category_id: String(v.category_id),
              slug: String(v.slug),
              title: String(v.title),
              description: String(v.description),
              base_price: num(v.base_price),
              currency: "UZS",
              delivery_minutes: num(v.delivery_minutes),
              is_active: v.is_active as boolean,
            }))
          }
          submitLabel={t("form.save")}
          busyLabel={t("form.saving")}
          okMsg={t("form.created")}
          errMsg={t("form.error")}
          onDone={reloadSvcs}
        />
      </div>
    </div>
  );
}
