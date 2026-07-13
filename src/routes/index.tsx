import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";
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
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const path = await resolvePostLoginPath(data.session.user.id);
      throw redirect({ to: path });
    }
  },
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
