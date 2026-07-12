import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { mode: "signin", redirect: location.href },
      });
    }

    // Onboarding gate
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .maybeSingle();

    const onOnboarding = location.pathname.startsWith("/onboarding");
    const done = !!profile?.onboarding_completed;

    if (!done && !onOnboarding) {
      throw redirect({ to: "/onboarding" });
    }
    if (done && onOnboarding) {
      const { resolvePostLoginPath } = await import("@/lib/postLoginRedirect");
      const path = await resolvePostLoginPath(data.user.id);
      throw redirect({ to: path });
    }

    return { user: data.user };
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
