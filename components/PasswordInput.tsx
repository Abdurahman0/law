"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconEye, IconEyeOff } from "./icons";

// Password field with a show/hide (eye) toggle. Drop-in replacement for a
// bare <input type="password">.
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const t = useTranslations("a11y");
  const [show, setShow] = useState(false);
  return (
    <div className="pwf">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="pwf__eye"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t("hidePassword") : t("showPassword")}
        aria-pressed={show}
        tabIndex={-1}
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}
