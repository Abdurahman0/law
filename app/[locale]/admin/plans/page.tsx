"use client";

import { useTranslations } from "next-intl";
import { getSubscriptionPlans } from "@/lib/services/backend";
import { createSubscriptionPlan } from "@/lib/services/admin";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { AdminForm, useReload } from "@/components/admin/AdminBits";
import { IconStar } from "@/components/icons";

const toList = (v: string | boolean) =>
  String(v || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
const num = (v: string | boolean) => parseInt(String(v || "0"), 10) || 0;

export default function AdminPlans() {
  const t = useTranslations("admin");
  const [key, reload] = useReload();
  const plans = useResource(getSubscriptionPlans, [key]);

  return (
    <div className="agrid">
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("plans.listTitle")}</b><span className="advmuted">{plans.data.length}</span></div>
        {plans.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !plans.data.length ? (
          <EmptyState icon={<IconStar />} title={t("plans.empty")} />
        ) : (
          <div className="alist">
            {plans.data.map((p) => (
              <div className="arow" key={p.id}>
                <b>{p.name}</b>
                <span>{p.price ? p.price.toLocaleString("ru-RU").replace(/,/g, " ") : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("plans.create")}</b></div>
        <AdminForm
          fields={[
            { name: "title", label: t("form.title"), required: true },
            { name: "slug", label: t("form.slug"), required: true, placeholder: "premium" },
            { name: "description", label: t("form.description"), type: "textarea" },
            { name: "monthly_price", label: t("form.monthlyPrice"), type: "number", placeholder: "149000" },
            { name: "benefits", label: t("plans.benefits"), type: "textarea", placeholder: t("plans.benefitsPh") },
            { name: "is_giftable", label: t("plans.giftable"), type: "checkbox" },
            { name: "is_active", label: t("form.active"), type: "checkbox" },
          ]}
          onSubmit={async (v) =>
            void (await createSubscriptionPlan({
              slug: String(v.slug),
              title: String(v.title),
              description: String(v.description),
              monthly_price: num(v.monthly_price),
              benefits: toList(v.benefits),
              is_giftable: v.is_giftable as boolean,
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
