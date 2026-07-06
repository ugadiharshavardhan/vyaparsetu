import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Building2, Eye, Loader2, Lock, Palette, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — VyaparSetu" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
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
      navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
    } catch {
      toast.error("Could not sign out");
      setSigningOut(false);
    }
  };

  return (
    <div className="container-page py-8">
      <PageHeader title="Settings" description="Preferences, notifications, security and integrations." />

      <Tabs defaultValue="general" className="mt-8">
        <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            { v: "general", label: "General", icon: Settings2 },
            { v: "business", label: "Business", icon: Building2 },
            { v: "notifications", label: "Notifications", icon: Bell },
            { v: "security", label: "Security", icon: Lock },
            { v: "appearance", label: "Appearance", icon: Palette },
            { v: "privacy", label: "Privacy", icon: Eye },
            { v: "integrations", label: "Integrations", icon: Sparkles },
          ].map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="gap-1.5 data-[state=active]:bg-brand-soft data-[state=active]:text-brand">
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <SectionCard title="Profile basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name"><Input defaultValue={profile?.full_name ?? ""} /></Field>
              <Field label="Contact email"><Input defaultValue={profile?.email ?? ""} readOnly /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="business">
          <SectionCard title="Business preferences" description="Configure MOQ defaults, GST invoice formatting and preferred logistics.">
            <p className="text-sm text-muted-foreground">Coming soon — configure invoice numbering, delivery windows and preferred logistics partners.</p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionCard title="Notifications">
            <div className="space-y-4">
              {[
                { id: "email", label: "Order & invoice emails", def: true },
                { id: "sms", label: "SMS alerts for delivery", def: true },
                { id: "wa", label: "WhatsApp updates", def: true },
                { id: "offers", label: "Weekly deals & bulk discounts", def: false },
                { id: "product", label: "Product recommendations", def: true },
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between">
                  <Label htmlFor={n.id} className="text-sm font-normal">{n.label}</Label>
                  <Switch id={n.id} defaultChecked={n.def} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <SectionCard title="Security">
            <p className="text-sm text-muted-foreground">Change your password or sign out.</p>
            <Separator className="my-5" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" asChild><a href="/forgot-password">Change password</a></Button>
              <Button variant="outline" onClick={signOut} disabled={signingOut}>
                {signingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign out of this device
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="appearance">
          <SectionCard title="Appearance">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark" className="text-sm font-normal">Dark mode</Label>
              <Switch id="dark" disabled />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Dark mode support is coming soon.</p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="privacy">
          <SectionCard title="Privacy">
            <div className="space-y-4">
              {[
                { id: "search", label: "Show my business in supplier search", def: true },
                { id: "analytics", label: "Share anonymous usage analytics", def: true },
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between">
                  <Label htmlFor={n.id} className="text-sm font-normal">{n.label}</Label>
                  <Switch id={n.id} defaultChecked={n.def} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="integrations">
          <SectionCard title="Future integrations">
            <p className="text-sm text-muted-foreground">
              Tally, Zoho Books, WhatsApp Business, ShipRocket and more integrations are coming soon.
            </p>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
