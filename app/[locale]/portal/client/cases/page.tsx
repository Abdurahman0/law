"use client";

import { useTranslations } from "next-intl";
import { CLIENT_ORDERS } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";

export default function ClientCases() {
  const t = useTranslations("portal.client.cases");
  const tc = useTranslations("portal.common");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <div className="ptable__wrap">
        <table className="ptable">
          <thead>
            <tr>
              <th>ID</th>
              <th>{tc("cols.case")}</th>
              <th>{tc("cols.client")}</th>
              <th>{tc("cols.status")}</th>
              <th>{tc("cols.payment")}</th>
            </tr>
          </thead>
          <tbody>
            {CLIENT_ORDERS.map((o) => (
              <tr key={o.id}>
                <td>
                  <b>#{o.id}</b>
                  <div style={{ color: "var(--gray2)", fontSize: ".8rem" }}>{o.date}</div>
                </td>
                <td>{o.service}</td>
                <td>{o.lawyer}</td>
                <td>
                  <StatusPill kind="status" value={o.status} />
                </td>
                <td>
                  <StatusPill kind="payment" value={o.payment} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
