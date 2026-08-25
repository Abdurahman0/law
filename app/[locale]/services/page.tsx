import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ServicesSection from "@/components/sections/ServicesSection";
import ServicesCompare from "@/components/sections/ServicesCompare";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ServicesSection />
      <ServicesCompare />
    </>
  );
}
