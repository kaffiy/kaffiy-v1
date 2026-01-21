import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { WhyKaffiySection } from "@/components/sections/home/WhyKaffiySection";
import { HowItWorksSection } from "@/components/sections/home/HowItWorksSection";
import { DashboardPreviewSection } from "@/components/sections/home/DashboardPreviewSection";
import { AppShowcaseSection } from "@/components/sections/home/AppShowcaseSection";
import { PartnersSection } from "@/components/sections/home/PartnersSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <DashboardPreviewSection />
      <WhyKaffiySection />
      <HowItWorksSection />
      <AppShowcaseSection />
      <PartnersSection />
    </Layout>
  );
};

export default Index;