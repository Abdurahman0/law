import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IconBolt,
  IconVideo,
  IconFileText,
  IconDocLines,
  IconShield,
  IconBuilding,
  IconGift,
} from "../icons";

const ICONS = [
  IconBolt,
  IconVideo,
  IconFileText,
  IconDocLines,
  IconShield,
  IconBuilding,
  IconGift,
];
const LINKS = [
  "/services",
  "/services",
  "/services",
  "/services",
  "/lawyers",
  "/business",
  "/subscription",
];

export default function QuickServices() {
  const t = useTranslations("home.quick");
  const items = t.raw("items") as { title: string; sub: string }[];
  return (
    <section className="quick">
      <div className="wrap">
        <div className="scroller">
          {items.map((it, i) => {
            const I = ICONS[i] ?? IconBolt;
            return (
              <Link key={i} href={LINKS[i] ?? "/services"} className="qtile">
                <span className="qtile__i">
                  <I />
                </span>
                <b>{it.title}</b>
                <span>{it.sub}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
