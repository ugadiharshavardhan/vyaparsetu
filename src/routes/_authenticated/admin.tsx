import { createFileRoute, redirect } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoonState } from "@/components/common/ComingSoonState";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin — VyaparSetu" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="container-page py-10">
      <PageHeader title="Admin console" description="Platform-level controls for VyaparSetu administrators." />
      <ComingSoonState
        icon={ShieldCheck}
        title="Admin tools coming soon"
        description="User management, supplier verification queue and platform analytics ship in Milestone 21."
      />
    </div>
  );
}
