"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { Resource, ResStatus } from "@/lib/useResource";
import { IconInfo } from "../icons";

// Skeleton shown while a backend list is loading.
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="pskel" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="pskel__row" key={i} />
      ))}
    </div>
  );
}

// Empty / error placeholder — no mock, just a clean message.
export function EmptyState({
  icon,
  title,
  text,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
}) {
  return (
    <div className="pempty">
      {icon ?? <IconInfo />}
      <b>{title}</b>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

// Convenience: render loading / error / empty around a ready list.
export function ResourceView<T>({
  res,
  icon,
  emptyTitle,
  emptyText,
  children,
  skeletonRows,
}: {
  res: Resource<T>;
  icon?: ReactNode;
  emptyTitle: string;
  emptyText?: string;
  children: (data: T[]) => ReactNode;
  skeletonRows?: number;
}) {
  const t = useTranslations("portal.common");
  if (res.status === "loading") return <Skeleton rows={skeletonRows} />;
  if (res.status === "error")
    return <EmptyState icon={icon} title={t("loadError")} text={t("loadErrorText")} />;
  if (!res.data.length)
    return <EmptyState icon={icon} title={emptyTitle} text={emptyText} />;
  return <>{children(res.data)}</>;
}

export type { ResStatus };
