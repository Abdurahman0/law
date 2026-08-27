"use client";

import { useTranslations } from "next-intl";
import type { AccountType } from "@/lib/types";
import {
  Icon,
  IconUser,
  IconScale,
  IconAward,
  IconCheck,
  IconArrowRight,
} from "../icons";

const TYPES: { type: AccountType; icon: string; accent: string }[] = [
  { type: "client", icon: "IconUser", accent: "client" },
  { type: "lawyer", icon: "IconScale", accent: "lawyer" },
  { type: "advocate", icon: "IconAward", accent: "advocate" },
];

// Keep icons referenced so tree-shaking doesn't drop them via the registry.
void [IconUser, IconScale, IconAward];

export default function AccountTypeCards({
  onChoose,
}: {
  onChoose: (t: AccountType) => void;
}) {
  const t = useTranslations("register.accountTypes");

  return (
    <div className="atypes">
      {TYPES.map(({ type, icon, accent }) => {
        const benefits = t.raw(`${type}.benefits`) as string[];
        return (
          <button
            key={type}
            type="button"
            className={`atype atype--${accent}`}
            onClick={() => onChoose(type)}
          >
            <span className="atype__i">
              <Icon name={icon} />
            </span>
            <b className="atype__name">{t(`${type}.name`)}</b>
            <span className="atype__tag">{t(`${type}.tagline`)}</span>
            <p className="atype__desc">{t(`${type}.desc`)}</p>
            <ul className="atype__list">
              {benefits.map((b, i) => (
                <li key={i}>
                  <IconCheck />
                  {b}
                </li>
              ))}
            </ul>
            <span className="atype__cta">
              {t(`${type}.cta`)}
              <IconArrowRight />
            </span>
          </button>
        );
      })}
    </div>
  );
}
