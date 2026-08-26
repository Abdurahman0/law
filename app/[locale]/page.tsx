import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import ProblemSection from "@/components/sections/ProblemSection";
import AiSection from "@/components/sections/AiSection";
import StagesSection from "@/components/sections/StagesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import LawyersSection from "@/components/sections/LawyersSection";
import Ticker from "@/components/sections/Ticker";
import SocialProofSection from "@/components/sections/SocialProofSection";
import WarrantySection from "@/components/sections/WarrantySection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import FaqSection from "@/components/sections/FaqSection";
import FinalCtaSection from "@/components/sections/FinalCtaSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Attention */}
      <Hero />
      <Stats />
      {/* Problem / Need */}
      <ProblemSection />
      {/* Solution */}
      <AiSection />
      <StagesSection />
      <ServicesSection />
      {/* Benefits */}
      <BenefitsSection />
      {/* Trust / Social proof */}
      <LawyersSection />
      <Ticker />
      <SocialProofSection />
      <WarrantySection />
      {/* Offer */}
      <SubscriptionSection />
      {/* Objection handling */}
      <FaqSection />
      {/* Main CTA */}
      <FinalCtaSection />
    </>
  );
}
