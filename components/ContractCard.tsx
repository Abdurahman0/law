"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import {
  contractInlineUrl,
  contractDownloadUrl,
  type Contract,
} from "@/lib/api";
import { IconFileText, IconDownload, IconExternal } from "./icons";

// Renders a contract PDF as an attachment. Prefers the inlined base64 payload
// (works even if the file endpoints are unreachable); falls back to the
// backend inline/download URLs.
export default function ContractCard({ c }: { c: Contract }) {
  const t = useTranslations("chatPage");

  const name =
    c.fileName || (c.contractType ? `${c.contractType}.pdf` : "contract.pdf");
  const openUrl = contractInlineUrl(c);
  const dlUrl = contractDownloadUrl(c);

  // With a base64 payload, build a short-lived blob URL on click instead of
  // following the backend link.
  function openBlob(e: MouseEvent<HTMLAnchorElement>, download: boolean) {
    if (!c.fileBase64) return;
    let url: string;
    try {
      const bin = atob(c.fileBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      url = URL.createObjectURL(
        new Blob([bytes], { type: c.mimeType || "application/pdf" }),
      );
    } catch {
      return; // malformed base64 → let the backend link handle it
    }
    e.preventDefault();
    if (download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } else {
      window.open(url, "_blank");
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return (
    <div className="aifile">
      <span className="aifile__i">
        <IconFileText />
      </span>
      <div className="aifile__t">
        <b>{c.contractType || name}</b>
        <span>PDF{c.status ? ` · ${c.status}` : ""}</span>
      </div>
      <div className="aifile__act">
        {c.fileBase64 || openUrl ? (
          <a
            className="aifile__btn"
            href={openUrl || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => openBlob(e, false)}
            aria-label={t("open")}
            title={t("open")}
          >
            <IconExternal />
          </a>
        ) : null}
        {c.fileBase64 || dlUrl ? (
          <a
            className="aifile__btn"
            href={dlUrl || "#"}
            download={name}
            onClick={(e) => openBlob(e, true)}
            aria-label={t("downloadPdf")}
            title={t("downloadPdf")}
          >
            <IconDownload />
          </a>
        ) : null}
      </div>
    </div>
  );
}
