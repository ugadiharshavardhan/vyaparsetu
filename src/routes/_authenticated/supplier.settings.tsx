import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/supplier/settings")({
  head: () => ({ meta: [{ title: "Settings — Supplier" }] }),
  component: SupplierSettingsPage,
});

function SupplierSettingsPage() {
  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Settings" description="Configure business, notifications, tax, shipping and security preferences." />

        <SectionCard title="Business" description="Storefront preferences">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Store display name"><Input defaultValue="VyaparSetu Wholesale" /></Field>
            <Field label="Support email"><Input defaultValue="hello@vyaparsetu.in" /></Field>
            <Field label="Default warehouse"><Input defaultValue="Central Mumbai Hub" /></Field>
            <Field label="Order acceptance window (hrs)"><Input type="number" defaultValue={24} /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <div className="space-y-2">
            <Toggle label="New order alerts" defaultChecked />
            <Toggle label="Low stock warnings" defaultChecked />
            <Toggle label="Payment received" defaultChecked />
            <Toggle label="Weekly performance summary" />
            <Toggle label="Marketing tips & product updates" />
          </div>
        </SectionCard>

        <SectionCard title="Tax">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="GST scheme"><Input defaultValue="Regular" /></Field>
            <Field label="Default GST %"><Input type="number" defaultValue={18} /></Field>
            <Field label="HSN mapping"><Input defaultValue="Auto-detect from category" /></Field>
            <Field label="Invoice prefix"><Input defaultValue="VS-INV" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Shipping">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Default handling time"><Input defaultValue="2 business days" /></Field>
            <Field label="Serviceable pincodes"><Input defaultValue="Pan-India" /></Field>
            <Field label="Free shipping above"><Input defaultValue="₹5,000" /></Field>
            <Field label="Preferred partner"><Input defaultValue="Delhivery, BlueDart" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Payments" description="Payout methods and settlement schedule (placeholder)">
          <p className="text-sm text-muted-foreground">Bank account and UPI settlement configuration will be enabled in a later release.</p>
        </SectionCard>

        <SectionCard title="Security">
          <div className="space-y-2">
            <Toggle label="Two-factor authentication" defaultChecked />
            <Toggle label="Login alerts" defaultChecked />
            <Toggle label="IP whitelist for API access" />
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved")}>Save all settings</Button>
        </div>
      </div>
    
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
