import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import AiSection from "@/components/sections/AiSection";
import AiDetails from "@/components/sections/AiDetails";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiPage" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <AiSection />
      <AiDetails />
    </>
  );
}
