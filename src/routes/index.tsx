import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
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
import { resolveAuthedUser } from "@/lib/resolveAuthedUser";
import { getSessionMode } from "@/lib/sessionMode";
import { getUserRole } from "@/lib/rbac";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    // Guests see the marketing landing. Returning signed-in users go straight
    // to their workspace (seller → dashboard, buyer → marketplace).
    if (typeof window === "undefined") return;
    try {
      const user = await resolveAuthedUser();
      if (!user) return;

      const mode = getSessionMode();
      if (mode === "seller") throw redirect({ to: "/seller/dashboard" });
      if (mode === "buyer") throw redirect({ to: "/marketplace" });

      // No session mode (e.g. returned later / cleared storage): use DB role.
      const role = await getUserRole(user.id);
      if (role === "seller") throw redirect({ to: "/seller/dashboard" });
      throw redirect({ to: "/marketplace" });
    } catch (e) {
      if (isRedirect(e)) throw e;
      // Auth/role lookup failure must not crash the landing page for guests.
      return;
    }
  },
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
