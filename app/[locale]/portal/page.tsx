"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "@/i18n/navigation";

export default function PortalIndex() {
  const { session, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    router.replace(session ? `/portal/${session.role}` : "/login");
  }, [ready, session, router]);
  return null;
}
