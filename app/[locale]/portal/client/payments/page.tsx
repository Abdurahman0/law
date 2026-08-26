"use client";

import { useTranslations } from "next-intl";
import { PAYMENTS } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";

export default function ClientPayments() {
  const t = useTranslations("portal.client.payments");
  const tc = useTranslations("portal.common");
  const te = useTranslations("enums");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("history")}</b>
        <button className="btn btn--pri btn--sm" type="button">
          {t("pay")}
        </button>
      </div>
      <div className="ptable__wrap">
        <table className="ptable">
          <thead>
            <tr>
              <th>{t("id")}</th>
              <th>{t("what")}</th>
              <th>{t("date")}</th>
              <th>{t("amount")}</th>
              <th>{tc("cols.status")}</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>#{p.id}</b>
                </td>
                <td>{p.what}</td>
                <td>{p.date}</td>
                <td>
                  {p.amount} {te("currency")}
                </td>
                <td>
                  <StatusPill kind="payment" value={p.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
