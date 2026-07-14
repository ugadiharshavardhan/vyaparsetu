import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BadgeCheck, Building2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UploadDropzone } from "@/components/onboarding/UploadDropzone";
import { BUSINESS_CATEGORIES } from "@/data/business";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProfile, useUpdateProfile, type Profile } from "@/hooks/useProfile";
import { useAccountFlags } from "@/hooks/useAccountFlags";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — VyaparSetu" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: account } = useAccountFlags();
  const update = useUpdateProfile();
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isVerified = profile?.verification_status === "verified";

  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Business profile"
        description="Manage your business identity and KYC information."
        action={
          <Button onClick={save} disabled={update.isPending} className="shadow-brand">
            {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl gradient-brand text-2xl font-bold text-white shadow-brand">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (profile?.business_name?.[0] ?? "V")
              )}
            </div>
            {isLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h3 className="mt-4 font-display text-lg font-semibold">{profile?.business_name ?? "Your business"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.owner_name ?? profile?.full_name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge status={profile?.verification_status ?? "pending"} />
                  {account?.kinds.map((k) => (
                    <span key={k} className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
                      {k}
                    </span>
                  ))}
                </div>
              </>
            )}
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" />{profile?.business_email ?? profile?.email ?? "—"}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{profile?.phone ?? "—"}</li>
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" />{profile?.business_type ?? "—"}</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand" />GSTIN: {profile?.gst_number ?? "—"}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" />{profile?.city ?? "—"}, {profile?.state ?? "—"}</li>
            </ul>
            <p className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
              Account created {profile ? new Date(profile.created_at).toLocaleDateString() : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-sm font-semibold">Brand assets</h3>
            <div className="mt-4 space-y-4">
              <UploadDropzone label="Business Logo" value={form.logo_url ?? null} onChange={(url) => set("logo_url", url)} accept="image/*" />
              <UploadDropzone label="Shop Image" value={form.shop_image_url ?? null} onChange={(url) => set("shop_image_url", url)} accept="image/*" />
            </div>
          </div>
        </div>

        <form className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <h3 className="font-display text-lg font-semibold">Account details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><Input value={form.business_name ?? ""} onChange={(e) => set("business_name", e.target.value)} /></Field>
            <Field label="Owner name"><Input value={form.owner_name ?? ""} onChange={(e) => set("owner_name", e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
            <Field label="Business email"><Input value={form.business_email ?? ""} onChange={(e) => set("business_email", e.target.value)} /></Field>
            <Field label="Website"><Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></Field>
            <Field label="Business category">
              <Select value={form.business_category ?? undefined} onValueChange={(v) => set("business_category", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={`GST number${isVerified ? " (locked)" : ""}`}>
              <Input value={form.gst_number ?? ""} onChange={(e) => set("gst_number", e.target.value.toUpperCase())} readOnly={isVerified} />
            </Field>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold">Business address</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address" className="sm:col-span-2"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
              <Field label="City"><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="State"><Input value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} /></Field>
              <Field label="Pincode"><Input value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value)} /></Field>
              <Field label="Country"><Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} /></Field>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
