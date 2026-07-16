import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/auth",
        search: { mode: "signin", redirect: "/admin" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      _user_id: data.user.id,
    });
    if (!isAdmin) {
      // Clear non-admin session so /auth can show the dedicated admin login form.
      await supabase.auth.signOut();
      throw redirect({
        to: "/auth",
        search: { mode: "signin", redirect: "/admin" },
      });
    }
  },
  head: () => ({ meta: [{ title: "Admin — VyaparSetu" }] }),
  component: () => <Outlet />,
});
