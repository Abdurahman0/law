"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function ClientAi() {
  const t = useTranslations("chatPage");
  const router = useRouter();
  const sugg = t.raw("suggestions") as string[];

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
      </div>
      <p style={{ margin: "0 0 18px", color: "var(--gray)", fontSize: ".92rem" }}>
        {t("emptyText")}
      </p>
      <div className="sugg">
        {sugg.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => router.push(`/chat?q=${encodeURIComponent(s)}`)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
