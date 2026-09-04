"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getUnreadCount } from "@/lib/services/backend";
import { IconBell } from "../icons";

export default function NotificationBell({ role }: { role: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    getUnreadCount()
      .then((c) => alive && setCount(c))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Link href={`/portal/${role}/notifications`} className="ptop__bell" aria-label="Notifications">
      <IconBell />
      {count > 0 ? <span className="ptop__badge">{count > 9 ? "9+" : count}</span> : null}
    </Link>
  );
}
