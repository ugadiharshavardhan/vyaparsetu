import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — VyaparSetu" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error("Could not sign out");
      setSigningOut(false);
    }
  };

  return (
    <div className="container-page py-10">
      <PageHeader title="Settings" description="Preferences, notifications and account controls." />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-brand" />
            <h3 className="font-display text-lg font-semibold">Notifications</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Choose how VyaparSetu keeps you informed.</p>
          <div className="mt-5 space-y-4">
            {[
              { id: "email", label: "Order & invoice emails", def: true },
              { id: "sms", label: "SMS alerts for delivery", def: true },
              { id: "offers", label: "Weekly deals & bulk discounts", def: false },
            ].map((n) => (
              <div key={n.id} className="flex items-center justify-between">
                <Label htmlFor={n.id} className="text-sm font-normal">{n.label}</Label>
                <Switch id={n.id} defaultChecked={n.def} disabled />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Account</h3>
          <p className="mt-1 text-sm text-muted-foreground">Session and security controls.</p>
          <Separator className="my-5" />
          <Button variant="outline" onClick={signOut} disabled={signingOut} className="w-full">
            {signingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign out of this device
          </Button>
        </section>
      </div>
    </div>
  );
}
