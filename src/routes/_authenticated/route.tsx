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
        search: {
          mode: "signin",
          redirect: location.pathname.startsWith("/admin") ? "/admin" : location.pathname,
        },
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
      queryKey: ["onboarding-complete", "v2", user.id],
      staleTime: 60_000,
      queryFn: async () => {
        const [seller, buyer] = await Promise.all([
          supabase
            .from("sellers")
            .select("id, onboarding_completed, business_name, gst_number")
            .eq("id", user.id)
            .maybeSingle(),
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

        const row = seller.data as {
          onboarding_completed?: boolean;
          business_name?: string | null;
          gst_number?: string | null;
        };

        if (row.onboarding_completed) return true;

        // Established sellers (already have business details) should reach the dashboard.
        const established =
          Boolean(row.business_name?.trim()) || Boolean(row.gst_number?.trim());
        if (established) {
          void supabase
            .from("sellers")
            .update({ onboarding_completed: true } as never)
            .eq("id", user.id)
            .then(() => undefined);
          return true;
        }

        return false;
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
