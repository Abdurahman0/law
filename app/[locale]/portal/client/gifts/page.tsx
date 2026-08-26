"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GIFTS } from "@/lib/portalData";

export default function ClientGifts() {
  const t = useTranslations("portal.client.gifts");
  const tc = useTranslations("portal.common");

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <Link href="/subscription" className="btn btn--pri btn--sm">
          {t("give")}
        </Link>
      </div>
      <div className="ptable__wrap">
        <table className="ptable">
          <thead>
            <tr>
              <th>{t("recipient")}</th>
              <th>{t("term")}</th>
              <th>{t("date")}</th>
              <th>{tc("cols.status")}</th>
            </tr>
          </thead>
          <tbody>
            {GIFTS.map((g) => (
              <tr key={g.id}>
                <td>
                  <b>{g.recipient}</b>
                </td>
                <td>
                  {g.term} {t("months")}
                </td>
                <td>{g.date}</td>
                <td>
                  <span className={`st st--${g.status}`}>{t(g.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
