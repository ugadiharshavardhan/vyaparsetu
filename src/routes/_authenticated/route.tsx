import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    // Use getSession() — reads from local storage synchronously (no network),
    // so navigation between authenticated routes is instant. getUser() would
    // hit the Auth server on every click and TanStack Router would keep the
    // previous page visible while it waited, causing a visible flicker
    // ("navigating to the previous section, then the target").
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;
    if (!user) {
      throw redirect({
        to: "/auth",
        search: { mode: "signin", redirect: location.href },
      });
    }

    // Onboarding gate — cached via the router's QueryClient so it runs once
    // per session instead of on every intra-app navigation.
    const onOnboarding = location.pathname.startsWith("/onboarding");
    const done = await context.queryClient.ensureQueryData({
      queryKey: ["onboarding-complete", user.id],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();
        return !!profile?.onboarding_completed;
      },
    });

    if (!done && !onOnboarding) {
      throw redirect({ to: "/onboarding" });
    }
    if (done && onOnboarding) {
      const { resolvePostLoginPath } = await import("@/lib/postLoginRedirect");
      const path = await resolvePostLoginPath(user.id);
      throw redirect({ to: path });
    }

    return { user };
  },
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (pathname.startsWith("/onboarding")) {
    return <Outlet />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
