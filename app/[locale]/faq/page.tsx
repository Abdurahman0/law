import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import FaqSection from "@/components/sections/FaqSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqSection />;
}
