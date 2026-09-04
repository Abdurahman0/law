import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import BusinessSection from "@/components/sections/BusinessSection";
import B2bSection from "@/components/sections/B2bSection";
import DirectionsSection from "@/components/sections/DirectionsSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "business" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <BusinessSection />
      <B2bSection />
      <DirectionsSection />
    </>
  );
}
