"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CLIENT_ORDERS, type ClientOrder } from "@/lib/portalData";
import StatusPill from "@/components/portal/StatusPill";
import FDate from "@/components/FDate";
import { IconClose } from "@/components/icons";

export default function ClientCases() {
  const t = useTranslations("portal.client.cases");
  const tc = useTranslations("portal.common");
  const tp = useTranslations("portal.client.payments");
  const te = useTranslations("enums");
  const [sel, setSel] = useState<ClientOrder | null>(null);
  const cur = te("currency");

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
              <th>{tc("lawyer")}</th>
              <th>{tc("cols.status")}</th>
              <th>{tc("cols.payment")}</th>
            </tr>
          </thead>
          <tbody>
            {CLIENT_ORDERS.map((o) => (
              <tr
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => setSel(o)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSel(o);
                }}
              >
                <td>
                  <b>#{o.id}</b>
                  <div style={{ color: "var(--gray2)", fontSize: ".8rem" }}>
                    <FDate v={o.date} />
                  </div>
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

      {sel ? (
        <div className="pmodal" onClick={() => setSel(null)}>
          <div className="pmodal__c" onClick={(e) => e.stopPropagation()}>
            <div className="pmodal__h">
              <b>#{sel.id}</b>
              <button
                className="pmodal__x"
                type="button"
                onClick={() => setSel(null)}
                aria-label={tc("close")}
              >
                <IconClose />
              </button>
            </div>
            <div className="pkv">
              <div className="pkv__i">
                <label>{tp("what")}</label>
                <b>{sel.service}</b>
              </div>
              <div className="pkv__i">
                <label>{tc("lawyer")}</label>
                <b>{sel.lawyer}</b>
              </div>
              <div className="pkv__i">
                <label>{tp("date")}</label>
                <b>
                  <FDate v={sel.date} />
                </b>
              </div>
              <div className="pkv__i">
                <label>{tp("amount")}</label>
                <b>
                  {sel.price} {cur}
                </b>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.status")}</label>
                <div>
                  <StatusPill kind="status" value={sel.status} />
                </div>
              </div>
              <div className="pkv__i">
                <label>{tc("cols.payment")}</label>
                <div>
                  <StatusPill kind="payment" value={sel.payment} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
