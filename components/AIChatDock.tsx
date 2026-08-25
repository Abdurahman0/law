"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ChatWidget from "./chat/ChatWidget";
import { IconChatDots } from "./icons";
import { OPEN_CHAT } from "@/lib/chatBus";

export default function AIChatDock() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN_CHAT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_CHAT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open && window.innerWidth <= 760) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className="fab"
        type="button"
        aria-label={t("openLabel")}
        onClick={() => setOpen(true)}
      >
        <IconChatDots />
        <span className="fab__b">AI</span>
      </button>
      <div
        className={`dockbg${open ? " on" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`dock${open ? " on" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label={t("title")}
      >
        {open ? (
          <ChatWidget variant="dock" onClose={() => setOpen(false)} />
        ) : null}
      </div>
    </>
  );
}
