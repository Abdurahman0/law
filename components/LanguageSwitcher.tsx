"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { IconGlobe } from "./icons";

const LABELS: Record<string, string> = {
  uz: "O‘zbek",
  ru: "Русский",
  en: "English",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function select(code: string) {
    setOpen(false);
    if (code !== locale) router.replace(pathname, { locale: code });
  }

  return (
    <div className="lang" ref={ref}>
      <button
        type="button"
        className="btn btn--glass btn--sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconGlobe style={{ width: 16, height: 16 }} />
        {locale.toUpperCase()}
      </button>
      {open ? (
        <ul className="lang__menu" role="listbox">
          {routing.locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                className={code === locale ? "on" : ""}
                onClick={() => select(code)}
              >
                {LABELS[code]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
