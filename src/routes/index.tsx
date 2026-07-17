import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/marketing/Hero";
import { ImpactStats } from "@/components/marketing/ImpactStats";
import { QualityAtEveryStep } from "@/components/marketing/QualityAtEveryStep";
import { NetworkSection } from "@/components/marketing/NetworkSection";
import { CategoriesPreview } from "@/components/marketing/CategoriesPreview";
import { FeaturedProducts } from "@/components/marketing/FeaturedProducts";
import { DeliveryModels } from "@/components/marketing/DeliveryModels";
import { ImpactSection } from "@/components/marketing/ImpactSection";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FaqSection } from "@/components/marketing/FaqSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export const Route = createFileRoute("/")({
  ssr: false,
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <QualityAtEveryStep />
      <NetworkSection />
      <CategoriesPreview />
      <FeaturedProducts />
      <DeliveryModels />
      <ImpactSection />
      <Testimonials />
      <CtaBanner />
      <FaqSection />
    </>
  );
}
