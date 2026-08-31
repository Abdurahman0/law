"use client";

import { useEffect, type ReactNode } from "react";
import { IconClose } from "../icons";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="amodal" onClick={onClose}>
      <div className="amodal__c" onClick={(e) => e.stopPropagation()}>
        <div className="amodal__h">
          <b>{title}</b>
          <button className="amodal__x" type="button" onClick={onClose} aria-label="close">
            <IconClose />
          </button>
        </div>
        <div className="amodal__b">{children}</div>
      </div>
    </div>
  );
}
