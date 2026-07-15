import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/seller")({
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    // Membership check only — do not use exclusive getUserRole (admins/dual accounts).
    const { data: seller } = await supabase
      .from("sellers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!seller) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: () => <Outlet />,
});
