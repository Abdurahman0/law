import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import LegalAidSection from "@/components/sections/LegalAidSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalAid" });
  return { title: t("title") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalAidSection />;
}
