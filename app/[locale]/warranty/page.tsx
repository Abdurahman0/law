import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import WarrantySection from "@/components/sections/WarrantySection";
import WarrantyProcess from "@/components/sections/WarrantyProcess";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warranty" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <WarrantySection />
      <WarrantyProcess />
    </>
  );
}
