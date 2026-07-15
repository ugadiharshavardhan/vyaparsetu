import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getSessionMode } from "@/lib/sessionMode";

export const Route = createFileRoute("/_authenticated/buyer")({
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    // Allow anyone with a buyers row — even if they also have a sellers row.
    // (Old check used getUserRole which preferred "seller" and blocked dual accounts.)
    const { data: buyer } = await supabase
      .from("buyers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (buyer) return;

    // Auto-heal: customer signed in but buyers row missing (failed signup upsert)
    const mode = getSessionMode();
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const wantsBuyer =
      mode === "buyer" ||
      meta.account_type === "buyer" ||
      meta.business_role === "buyer";

    if (wantsBuyer || mode !== "seller") {
      const email = (user.email ?? "").toLowerCase();
      const fullName = String(meta.full_name ?? meta.owner_name ?? "").trim() || email.split("@")[0] || "Buyer";
      const { error } = await supabase.from("buyers").upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          business_name: String(meta.business_name ?? fullName),
          phone: String(meta.phone ?? ""),
          whatsapp: String(meta.whatsapp ?? meta.phone ?? ""),
          address: String(meta.address ?? ""),
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: "id" },
      );
      if (!error) return;
      console.warn("[buyer-gate] ensure buyer failed", error.message);
    }

    throw redirect({ to: "/unauthorized" });
  },
  component: () => <Outlet />,
});
