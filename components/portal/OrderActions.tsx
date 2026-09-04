"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { acceptOrder, declineOrder } from "@/lib/services/backend";
import { IconCheck, IconClose } from "@/components/icons";

// Accept / decline controls for an open order (lawyer dashboard, marketplace,
// advocate opportunities). Shows a resolved badge once actioned.
export default function OrderActions({
  orderId,
  onDone,
}: {
  orderId: string;
  onDone?: (action: "accept" | "decline") => void;
}) {
  const tc = useTranslations("portal.common");
  const [busy, setBusy] = useState<null | "accept" | "decline">(null);
  const [done, setDone] = useState<null | "accept" | "decline">(null);

  async function run(action: "accept" | "decline") {
    if (busy || done) return;
    setBusy(action);
    try {
      if (action === "accept") await acceptOrder(orderId);
      else await declineOrder(orderId);
      setDone(action);
      onDone?.(action);
    } catch {
      /* ignore — button re-enables */
    } finally {
      setBusy(null);
    }
  }

  if (done) {
    return (
      <span className={`pcase__done pcase__done--${done}`}>
        {done === "accept" ? <IconCheck /> : <IconClose />}
        {done === "accept" ? tc("accepted") : tc("declined")}
      </span>
    );
  }

  return (
    <div className="pcase__act">
      <button className="btn btn--pri btn--sm" type="button" disabled={!!busy} onClick={() => run("accept")}>
        {busy === "accept" ? tc("accepting") : tc("accept")}
      </button>
      <button className="btn btn--line btn--sm" type="button" disabled={!!busy} onClick={() => run("decline")}>
        {tc("decline")}
      </button>
    </div>
  );
}
