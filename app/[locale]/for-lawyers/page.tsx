import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ForLawyersSection from "@/components/sections/ForLawyersSection";
import ForLawyersExtras from "@/components/sections/ForLawyersExtras";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forLawyers" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ForLawyersSection />
      <ForLawyersExtras />
    </>
  );
}
