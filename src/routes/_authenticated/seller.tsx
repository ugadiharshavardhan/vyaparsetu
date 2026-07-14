import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/rbac";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/seller")({
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (user) {
      const role = await getUserRole(user.id);
      if (role !== "seller") {
        throw redirect({ to: "/unauthorized" });
      }
    }
  },
  component: () => <Outlet />,
});
