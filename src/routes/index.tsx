import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/marketing/Hero";
import { TrustedBy } from "@/components/marketing/TrustedBy";
import { CategoriesPreview } from "@/components/marketing/CategoriesPreview";
import { FeaturedProducts } from "@/components/marketing/FeaturedProducts";
import { WhyVyaparSetu } from "@/components/marketing/WhyVyaparSetu";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FaqSection } from "@/components/marketing/FaqSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <CategoriesPreview />
      <FeaturedProducts />
      <WhyVyaparSetu />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
