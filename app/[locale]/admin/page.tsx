"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import {
  getServices,
  getServiceCategories,
  getSubscriptionPlans,
  getDocumentTemplates,
  listLawyers,
  listOrders,
  listCases,
} from "@/lib/services/backend";
import { getRoles } from "@/lib/services/admin";

const CARDS: { key: string; fn: () => Promise<unknown[]> }[] = [
  { key: "services", fn: getServices },
  { key: "categories", fn: getServiceCategories },
  { key: "plans", fn: getSubscriptionPlans },
  { key: "templates", fn: getDocumentTemplates },
  { key: "lawyers", fn: listLawyers },
  { key: "orders", fn: listOrders },
  { key: "cases", fn: listCases },
  { key: "roles", fn: getRoles },
];

export default function AdminOverview() {
  const t = useTranslations("admin.overview");
  const { session } = useAuth();
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let alive = true;
    Promise.allSettled(CARDS.map((c) => c.fn())).then((res) => {
      if (!alive) return;
      const m: Record<string, number | null> = {};
      CARDS.forEach((c, i) => {
        m[c.key] = res[i].status === "fulfilled" ? (res[i] as PromiseFulfilledResult<unknown[]>).value.length : null;
      });
      setCounts(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="advhero">
        <div className="advhero__t">
          <span className="advhero__k">{t("kicker")}</span>
          <h2 className="psec-h" style={{ color: "#fff" }}>{t("hi", { name: session?.name ?? "" })}</h2>
          <p>{t("sub")}</p>
        </div>
      </div>
      <div className="pk">
        {CARDS.map((c) => (
          <div className="pk__i" key={c.key}>
            <b>{counts[c.key] ?? "—"}</b>
            <span>{t(c.key)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
