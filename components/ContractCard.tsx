"use client";

import { useEffect, useState } from "react";
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!c.fileBase64) return;
    let url: string | null = null;
    try {
      const bin = atob(c.fileBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      url = URL.createObjectURL(
        new Blob([bytes], { type: c.mimeType || "application/pdf" }),
      );
      setBlobUrl(url);
    } catch {
      /* ignore malformed base64 */
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [c.fileBase64, c.mimeType]);

  const name =
    c.fileName || (c.contractType ? `${c.contractType}.pdf` : "contract.pdf");
  const openUrl = blobUrl || contractInlineUrl(c);
  const dlUrl = blobUrl || contractDownloadUrl(c);

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
        {openUrl ? (
          <a
            className="aifile__btn"
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("open")}
            title={t("open")}
          >
            <IconExternal />
          </a>
        ) : null}
        {dlUrl ? (
          <a
            className="aifile__btn"
            href={dlUrl}
            download={name}
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
