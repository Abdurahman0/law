import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import SubscriptionExtras from "@/components/sections/SubscriptionExtras";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subscription" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SubscriptionSection />
      <SubscriptionExtras />
    </>
  );
}
