import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Business Onboarding — VyaparSetu" }] }),
  component: OnboardingWizard,
});
