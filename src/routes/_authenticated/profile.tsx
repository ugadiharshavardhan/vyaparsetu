import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, Heart, Loader2, Mail, MapPin, Phone, ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateBuyerContact, useUpdateProfile, type Profile } from "@/hooks/useProfile";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartCount } from "@/hooks/useCart";
import { openCartSheet } from "@/hooks/useCartSheet";
import { useSessionMode } from "@/hooks/useSessionMode";
import { inr } from "@/lib/format";
import { BUSINESS_CATEGORIES } from "@/data/business";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UploadDropzone } from "@/components/onboarding/UploadDropzone";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { SaveProductButton } from "@/components/product/SaveProductButton";
import type { WishlistItem } from "@/types/commerce";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — VyaparSetu" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: account } = useAccountFlags();
  const sessionMode = useSessionMode();
  // Buyer session (or buyer-only account) gets the simplified contact profile
  const isBuyerView =
    sessionMode === "buyer" || (!!account?.isBuyer && !account?.isSeller && sessionMode !== "seller");

  if (isBuyerView) return <BuyerProfilePage />;
  return <SellerOrFullProfilePage />;
}

function BuyerProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const update = useUpdateBuyerContact();
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const { data: saved = [], isLoading: savedLoading } = useWishlist();
  const cartCount = useCartCount();

  useEffect(() => {
    if (!profile) return;
    setPhone(profile.phone ?? "");
    setWhatsapp(profile.whatsapp ?? "");
    setAddress(profile.address ?? "");
  }, [profile]);

  const displayName =
    profile?.business_name ||
    profile?.full_name ||
    profile?.owner_name ||
    user?.email?.split("@")[0] ||
    "Your account";

  const save = async () => {
    try {
      await update.mutateAsync({
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
      });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  if (isError) {
    return (
      <div className="container-page py-8">
        <PageHeader title="Your profile" description="We couldn't load your profile." />
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{(error as Error)?.message || "Please try again."}</p>
          <Button className="mt-5 shadow-brand" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Your profile"
        description="Contact details from signup. Update phone, WhatsApp or business address anytime."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openCartSheet()}>
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Button>
            <Button onClick={save} disabled={update.isPending || isLoading} className="shadow-brand">
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-brand text-2xl font-bold text-white shadow-brand">
            {displayName[0]?.toUpperCase() ?? "V"}
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h3 className="mt-4 font-display text-lg font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{profile?.full_name ?? profile?.owner_name ?? "—"}</p>
            </>
          )}
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />
              {profile?.email ?? user?.email ?? "—"}
            </li>
            <li className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand" />
              {profile?.business_name ?? "—"}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand" />
              {profile?.phone || "No phone yet"}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{profile?.address || "No business address yet"}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <form
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <h3 className="font-display text-lg font-semibold">Contact details</h3>
            <p className="text-sm text-muted-foreground">
              These are the only details buyers need. Changes are saved to your account in the database.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </Field>
              <Field label="WhatsApp number">
                <Input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Same as phone if empty"
                />
              </Field>
            </div>

            <Field label="Business address">
              <Textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop / street, area, city, pincode"
              />
            </Field>

            <Button type="submit" className="shadow-brand" disabled={update.isPending}>
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save to database
            </Button>
          </form>

          <SavedItemsSection saved={saved} savedLoading={savedLoading} />
        </div>
      </div>
    </div>
  );
}

function SellerOrFullProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { data: account } = useAccountFlags();
  const update = useUpdateProfile();
  const [form, setForm] = useState<Partial<Profile>>({});
  const cartCount = useCartCount();

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isVerified = profile?.verification_status === "verified";
  const displayName =
    profile?.business_name || profile?.full_name || user?.email?.split("@")[0] || "Your account";

  const save = async () => {
    try {
      await update.mutateAsync({
        business_name: form.business_name,
        owner_name: form.owner_name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        business_email: form.business_email,
        website: form.website,
        business_category: form.business_category,
        gst_number: form.gst_number,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        logo_url: form.logo_url,
        shop_image_url: form.shop_image_url,
      });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  if (isError) {
    return (
      <div className="container-page py-8">
        <PageHeader title="Business profile" description="We couldn't load your profile." />
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{(error as Error)?.message || "Please try again."}</p>
          <Button className="mt-5 shadow-brand" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Business profile"
        description="Manage your seller business identity."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openCartSheet()}>
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Button>
            <Button onClick={save} disabled={update.isPending || isLoading} className="shadow-brand">
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl gradient-brand text-2xl font-bold text-white shadow-brand">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase() ?? "V"
              )}
            </div>
            {isLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h3 className="mt-4 font-display text-lg font-semibold">{displayName}</h3>
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
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-sm font-semibold">Brand assets</h3>
            <div className="mt-4 space-y-4">
              <UploadDropzone label="Business Logo" value={form.logo_url ?? null} onChange={(url) => set("logo_url", url)} accept="image/*" />
              <UploadDropzone label="Shop Image" value={form.shop_image_url ?? null} onChange={(url) => set("shop_image_url", url)} accept="image/*" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); void save(); }}>
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
    </div>
  );
}

function SavedItemsSection({
  saved,
  savedLoading,
}: {
  saved: WishlistItem[];
  savedLoading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Heart className="h-5 w-5 text-brand" /> Saved items
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Products you saved. Tap Saved to remove. {saved.length} saved.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/wishlist">View all saved</Link>
        </Button>
      </div>

      {savedLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No saved items yet</p>
          <Button asChild className="mt-4 shadow-brand" size="sm">
            <Link to="/marketplace">Browse marketplace</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {saved.slice(0, 6).map((it) => {
            const p = it.product_snapshot;
            return (
              <li key={it.id} className="flex gap-3 rounded-xl border border-border p-3">
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary"
                >
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="line-clamp-2 text-sm font-semibold hover:text-brand"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-0.5 text-sm font-bold">{inr(p.wholesalePrice)}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <AddToCartControl snapshot={p} size="sm" className="min-w-[6.5rem]" />
                    <SaveProductButton snapshot={p} variant="button" size="sm" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
