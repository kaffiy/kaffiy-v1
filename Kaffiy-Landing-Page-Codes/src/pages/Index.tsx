import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { WhyKaffiySection } from "@/components/sections/home/WhyKaffiySection";
import { HowItWorksSection } from "@/components/sections/home/HowItWorksSection";
import { DashboardPreviewSection } from "@/components/sections/home/DashboardPreviewSection";

import { LeadFormSection } from "@/components/sections/home/LeadFormSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <DashboardPreviewSection />
      <WhyKaffiySection />
      <HowItWorksSection />
      <LeadFormSection />
    </Layout>
  );
};

export default Index;