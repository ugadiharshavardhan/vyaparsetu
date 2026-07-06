import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Camera, Facebook, Globe, Instagram, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/supplier/profile")({
  head: () => ({ meta: [{ title: "Business Profile — Supplier" }] }),
  component: BusinessProfilePage,
});

function BusinessProfilePage() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [about, setAbout] = useState("Trusted wholesale partner serving 400+ retailers across India with premium groceries and daily-need staples.");
  const [hours, setHours] = useState("Mon-Sat: 9:00 AM – 7:00 PM • Sun: Closed");
  const [social, setSocial] = useState({ website: "", instagram: "", facebook: "", linkedin: "" });

  return (
    <DashboardLayout>
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Business profile"
          description="This is how buyers see your storefront across the marketplace."
          action={<Button onClick={() => { updateProfile.mutate({}); toast.success("Profile saved"); }}>Save changes</Button>}
        />

        <SectionCard title="Brand identity" description="Logo, banner and public name">
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-24 w-24 place-items-center rounded-2xl border border-dashed border-border bg-muted">
                {profile?.logo_url ? <img src={profile.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
              </div>
              <Button size="sm" variant="outline">Upload logo</Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Business name</Label>
                <Input defaultValue={profile?.business_name ?? ""} />
              </div>
              <div>
                <Label>Owner name</Label>
                <Input defaultValue={profile?.owner_name ?? profile?.full_name ?? ""} />
              </div>
              <div>
                <Label>About your business</Label>
                <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Compliance" description="GST, PAN and other business documents">
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="GST number" defaultValue={profile?.gst_number ?? ""} />
            <Row label="PAN number" defaultValue={profile?.pan_number ?? ""} />
            <Row label="Years in business" defaultValue={String(profile?.years_in_business ?? "")} />
            <Row label="Business category" defaultValue={profile?.business_category ?? ""} />
          </div>
        </SectionCard>

        <SectionCard title="Address & contact">
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="Business email" defaultValue={profile?.business_email ?? profile?.email ?? ""} />
            <Row label="Phone" defaultValue={profile?.phone ?? ""} />
            <Row label="WhatsApp" defaultValue={profile?.whatsapp ?? ""} />
            <Row label="Website" defaultValue={profile?.website ?? ""} />
            <Row label="Address" defaultValue={profile?.address ?? ""} span />
            <Row label="City" defaultValue={profile?.city ?? ""} />
            <Row label="State" defaultValue={profile?.state ?? ""} />
            <Row label="Pincode" defaultValue={profile?.pincode ?? ""} />
            <Row label="Country" defaultValue={profile?.country ?? "India"} />
          </div>
        </SectionCard>

        <SectionCard title="Working hours & social">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Working hours</Label>
              <Textarea rows={3} value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <SocialRow icon={Globe} label="Website" value={social.website} onChange={(v) => setSocial({ ...social, website: v })} />
              <SocialRow icon={Instagram} label="Instagram" value={social.instagram} onChange={(v) => setSocial({ ...social, instagram: v })} />
              <SocialRow icon={Facebook} label="Facebook" value={social.facebook} onChange={(v) => setSocial({ ...social, facebook: v })} />
              <SocialRow icon={Linkedin} label="LinkedIn" value={social.linkedin} onChange={(v) => setSocial({ ...social, linkedin: v })} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Certificates" description="Uploaded compliance documents & industry certifications">
          <div className="grid gap-3 sm:grid-cols-3">
            {["FSSAI Licence", "ISO 9001", "MSME Registration"].map((c) => (
              <div key={c} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand"><Building2 className="h-4 w-4" /></div>
                <div className="mt-3 font-semibold">{c}</div>
                <div className="text-xs text-muted-foreground">Uploaded • valid till 2027</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, defaultValue, span }: { label: string; defaultValue?: string; span?: boolean }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

function SocialRow({ icon: Icon, label, value, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></span>
      <Input placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
