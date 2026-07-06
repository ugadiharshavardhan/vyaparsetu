import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Building2, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { useProfile, useRoles } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — VyaparSetu" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: roles } = useRoles();

  return (
    <div className="container-page py-10">
      <PageHeader title="Business profile" description="Manage your business identity and KYC information." />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-brand text-2xl font-bold text-white shadow-brand">
            {profile?.business_name?.[0] ?? profile?.full_name?.[0] ?? "V"}
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {profile?.business_name ?? "Your business"}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <VerifiedBadge
                  label={profile?.verification_status === "verified" ? "Verified" : "Pending KYC"}
                />
                {roles?.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </>
          )}
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" />{profile?.email ?? "—"}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{profile?.phone ?? "—"}</li>
            <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" />{profile?.business_type ?? "—"}</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand" />GSTIN: {profile?.gst_number ?? "Not provided"}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" />India</li>
          </ul>
        </div>

        <form className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Account details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Owner name</Label>
              <Input id="fullName" defaultValue={profile?.full_name ?? ""} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" defaultValue={profile?.business_name ?? ""} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={profile?.email ?? ""} disabled className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={profile?.phone ?? ""} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="gst">GSTIN</Label>
              <Input id="gst" defaultValue={profile?.gst_number ?? ""} className="mt-1.5 h-11 uppercase" />
            </div>
            <div>
              <Label htmlFor="type">Business type</Label>
              <Input id="type" defaultValue={profile?.business_type ?? ""} disabled className="mt-1.5 h-11 capitalize" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="button" className="shadow-brand" disabled title="Profile editing arrives in the next milestone">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
