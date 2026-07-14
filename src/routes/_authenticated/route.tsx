import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;
    if (!user) {
      throw redirect({
        to: "/auth",
        search: { mode: "signin", redirect: location.href },
      });
    }

    // Onboarding is seller-only and lives on public.sellers (not profiles).
    const path = location.pathname;
    const onOnboarding = path.startsWith("/onboarding");
    const skipOnboardingGate =
      onOnboarding ||
      path.startsWith("/profile") ||
      path.startsWith("/wishlist") ||
      path.startsWith("/settings") ||
      path.startsWith("/cart") ||
      path.startsWith("/checkout") ||
      path.startsWith("/addresses") ||
      path.startsWith("/orders") ||
      path.startsWith("/payments");

    const done = await context.queryClient.ensureQueryData({
      queryKey: ["onboarding-complete", user.id],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const [seller, buyer] = await Promise.all([
          supabase.from("sellers").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("buyers").select("id").eq("id", user.id).maybeSingle(),
        ]);

        if (seller.error) {
          console.warn("[onboarding-complete]", seller.error.message);
          return true;
        }

        // Buyers never need the seller onboarding wizard.
        if (buyer.data && !seller.data) return true;
        // Not a seller (admin / unknown) — don't trap on onboarding.
        if (!seller.data) return true;

        const row = seller.data as { onboarding_completed?: boolean };
        // Missing column (pre-migration) → don't block the app shell
        if (!("onboarding_completed" in row)) return true;
        return !!row.onboarding_completed;
      },
    });

    if (!done && !skipOnboardingGate) {
      throw redirect({ to: "/onboarding" });
    }
    if (done && onOnboarding) {
      const { resolvePostLoginPath } = await import("@/lib/postLoginRedirect");
      const next = await resolvePostLoginPath(user.id);
      throw redirect({ to: next });
    }

    return { user };
  },
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/checkout")) {
    return <Outlet />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
