import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import QuickServices from "@/components/sections/QuickServices";
import Ticker from "@/components/sections/Ticker";
import Stats from "@/components/sections/Stats";
import AiSection from "@/components/sections/AiSection";
import LawyersSection from "@/components/sections/LawyersSection";
import StagesSection from "@/components/sections/StagesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import DirectionsSection from "@/components/sections/DirectionsSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import WarrantySection from "@/components/sections/WarrantySection";
import ForLawyersSection from "@/components/sections/ForLawyersSection";
import AppCourseSection from "@/components/sections/AppCourseSection";
import FaqSection from "@/components/sections/FaqSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <QuickServices />
      <Ticker />
      <Stats />
      <AiSection />
      <LawyersSection />
      <StagesSection />
      <ServicesSection />
      <DirectionsSection />
      <SubscriptionSection />
      <WarrantySection />
      <ForLawyersSection />
      <AppCourseSection />
      <FaqSection />
    </>
  );
}
