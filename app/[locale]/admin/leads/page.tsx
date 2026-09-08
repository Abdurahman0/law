"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

// The leads list is now part of the unified sales workspace (pipeline).
// Keep this route working for old links by redirecting there.
export default function LeadsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/pipeline");
  }, [router]);
  return null;
}
