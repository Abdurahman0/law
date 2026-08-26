"use client";

import { useLocale } from "next-intl";
import { fmtDate } from "@/lib/date";

export default function FDate({ v }: { v: string }) {
  return <>{fmtDate(v, useLocale())}</>;
}
