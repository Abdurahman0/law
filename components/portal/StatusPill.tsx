"use client";

import { useTranslations } from "next-intl";

export default function StatusPill({
  kind,
  value,
}: {
  kind: "status" | "payment";
  value: string;
}) {
  const t = useTranslations("portal.common");
  return <span className={`st st--${value}`}>{t(`${kind}.${value}`)}</span>;
}
