import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);

  const save = () => toast.success("Settings saved");

  return (
    <AdminLayout>
      <PageHeader title="System settings" description="Platform configuration, business rules and operational toggles." />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="rules">Business rules</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SectionCard title="Brand & contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Platform name</Label><Input defaultValue="VyaparSetu" /></div>
              <div><Label>Support email</Label><Input defaultValue="support@vyaparsetu.in" /></div>
              <div><Label>Support phone</Label><Input defaultValue="+91 80 4712 0000" /></div>
              <div><Label>Default currency</Label><Input defaultValue="INR" /></div>
              <div className="sm:col-span-2"><Label>Registered address</Label><Textarea defaultValue="Prestige Tower, MG Road, Bengaluru 560001" rows={2} /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="platform">
          <SectionCard title="Platform toggles">
            <ToggleRow label="Allow guest browsing" hint="Non-signed-in users can browse marketplace" defaultChecked />
            <ToggleRow label="Auto-approve retailers" hint="Skip manual review for retailer signups" defaultChecked />
            <ToggleRow label="Require GST for suppliers" hint="Suppliers must provide GST before listing" defaultChecked />
            <ToggleRow label="Wishlist enabled" defaultChecked />
            <ToggleRow label="Reviews enabled" defaultChecked />
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="tax">
          <SectionCard title="Tax configuration">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>Default GST %</Label><Input type="number" defaultValue={18} /></div>
              <div><Label>Reduced GST %</Label><Input type="number" defaultValue={12} /></div>
              <div><Label>Zero GST %</Label><Input type="number" defaultValue={0} /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="shipping">
          <SectionCard title="Shipping rules">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>Free shipping above (₹)</Label><Input type="number" defaultValue={10000} /></div>
              <div><Label>Standard shipping (₹)</Label><Input type="number" defaultValue={250} /></div>
              <div><Label>Express shipping (₹)</Label><Input type="number" defaultValue={600} /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="rules">
          <SectionCard title="Business rules">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Min. order value (₹)</Label><Input type="number" defaultValue={500} /></div>
              <div><Label>Platform commission (%)</Label><Input type="number" defaultValue={8} /></div>
              <div><Label>Refund window (days)</Label><Input type="number" defaultValue={7} /></div>
              <div><Label>Cancellation window (hours)</Label><Input type="number" defaultValue={24} /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="theme">
          <SectionCard title="Theme settings">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>Primary color</Label><Input defaultValue="#5B21B6" type="text" /></div>
              <div><Label>Accent color</Label><Input defaultValue="#F97316" type="text" /></div>
              <div><Label>Font family</Label><Input defaultValue="Inter" /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="maintenance">
          <SectionCard title="Maintenance mode" description="When enabled, buyers see a maintenance page.">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-3">
              <div>
                <div className="font-medium">Enable maintenance mode</div>
                <div className="text-xs text-muted-foreground">Admins retain access. All other traffic is paused.</div>
              </div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
            <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function ToggleRow({ label, hint, defaultChecked }: { label: string; hint?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <div>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}
