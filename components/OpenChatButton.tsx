"use client";

import type { ReactNode } from "react";
import { openChat } from "@/lib/chatBus";

export default function OpenChatButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={openChat}>
      {children}
    </button>
  );
}
