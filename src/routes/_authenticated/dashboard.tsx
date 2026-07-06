import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, BellRing, CreditCard, PackageSearch, Percent, ShieldCheck,
  ShoppingCart, Sparkles, Store, TrendingUp, Truck, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useProfile, useRoles } from "@/hooks/useProfile";
import { DEMO_ACTIVITY, DEMO_NOTIFICATIONS, DEMO_SUPPLIERS } from "@/data/dashboard";
import { PRODUCTS } from "@/data/products";
import { inr as formatCurrencyINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VyaparSetu" }] }),
  component: DashboardPage,
});

const ROLE_KPIS = {
  retailer: [
    { label: "Open orders", value: "3", hint: "This week", icon: ShoppingCart, tone: "brand" as const },
    { label: "In transit", value: "1", hint: "ETA 2 days", icon: Truck, tone: "info" as const },
    { label: "Credit available", value: "₹0", hint: "KYC required", icon: CreditCard, tone: "warning" as const },
    { label: "Saved this month", value: formatCurrencyINR(24500), hint: "vs local rates", icon: TrendingUp, tone: "success" as const },
  ],
  wholesaler: [
    { label: "Open orders", value: "12", hint: "This week", icon: ShoppingCart, tone: "brand" as const },
    { label: "Fulfilment rate", value: "98%", hint: "Last 30d", icon: Truck, tone: "success" as const },
    { label: "Revenue MTD", value: formatCurrencyINR(482000), hint: "Excl. GST", icon: Wallet, tone: "info" as const },
    { label: "New buyers", value: "23", hint: "This month", icon: Sparkles, tone: "warning" as const },
  ],
  distributor: [
    { label: "Active shipments", value: "18", hint: "In transit", icon: Truck, tone: "brand" as const },
    { label: "Retailers served", value: "142", hint: "Last 30d", icon: Store, tone: "info" as const },
    { label: "Revenue MTD", value: formatCurrencyINR(1_240_000), hint: "Excl. GST", icon: Wallet, tone: "success" as const },
    { label: "SLA", value: "99.2%", hint: "On-time", icon: TrendingUp, tone: "warning" as const },
  ],
  manufacturer: [
    { label: "Purchase orders", value: "27", hint: "This week", icon: PackageSearch, tone: "brand" as const },
    { label: "Units produced", value: "48,320", hint: "MTD", icon: Truck, tone: "info" as const },
    { label: "Revenue MTD", value: formatCurrencyINR(6_820_000), hint: "Excl. GST", icon: Wallet, tone: "success" as const },
    { label: "Repeat buyers", value: "78%", hint: "Last quarter", icon: TrendingUp, tone: "warning" as const },
  ],
  admin: [
    { label: "Total users", value: "1,284", hint: "+12% MoM", icon: Sparkles, tone: "brand" as const },
    { label: "Pending KYC", value: "36", hint: "Review queue", icon: ShieldCheck, tone: "warning" as const },
    { label: "GMV MTD", value: formatCurrencyINR(12_400_000), hint: "Platform-wide", icon: Wallet, tone: "success" as const },
    { label: "Support tickets", value: "9", hint: "Open", icon: BellRing, tone: "info" as const },
  ],
};

function profileCompletion(p: ReturnType<typeof useProfile>["data"]) {
  if (!p) return 0;
  const fields = [
    p.business_name, p.owner_name, p.business_type, p.business_category,
    p.gst_number, p.address, p.city, p.state, p.pincode,
    p.phone, p.business_email, p.logo_url, p.shop_image_url, p.gst_certificate_url,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function DashboardPage() {
  const { data: profile, isLoading } = useProfile();
  const { data: roles } = useRoles();
  const role = (roles?.[0] ?? "retailer") as keyof typeof ROLE_KPIS;
  const kpis = ROLE_KPIS[role];
  const completion = profileCompletion(profile);

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {isLoading ? "Welcome back" : `Welcome back, ${profile?.owner_name?.split(" ")[0] ?? profile?.full_name?.split(" ")[0] ?? "there"} 👋`}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.business_name ? `${profile.business_name} · ${role.charAt(0).toUpperCase() + role.slice(1)}` : "Your VyaparSetu business dashboard"}
          </p>
        </div>
        <Button asChild size="lg" className="shadow-brand">
          <Link to="/marketplace">Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => <StatCard key={k.label} {...k} delay={i * 0.05} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Recent activity"
            description="What's happened on your account recently"
          >
            <ul className="divide-y">
              {DEMO_ACTIVITY.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>{a.label}</span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </motion.li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Favourite suppliers"
            description="Verified partners you buy from often"
            action={<Button variant="outline" size="sm" asChild><Link to="/suppliers">View all</Link></Button>}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {DEMO_SUPPLIERS.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-sm font-bold text-white">
                    {s.name[0]}
                  </div>
                  <div className="mt-3 truncate font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.city} · ★ {s.rating}</div>
                  <div className="mt-2 text-[11px] font-medium text-brand">{s.products}+ products</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Recommended for you"
            description="Bulk deals matched to your business"
            action={<Button variant="outline" size="sm" asChild><Link to="/marketplace">Explore</Link></Button>}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="group flex gap-3 rounded-xl border border-border bg-muted/30 p-3 hover:border-brand/40 hover:bg-brand-soft/20"
                >
                  <div
                    className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">MOQ {p.moq} {p.unit}</div>
                    <div className="mt-1 text-sm font-bold text-brand">{formatCurrencyINR(p.wholesalePrice)}/{p.unit}</div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Business verification">
            {isLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-sm font-bold text-white">
                    {profile?.business_name?.[0] ?? "V"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{profile?.business_name ?? "Your business"}</div>
                    <StatusBadge status={profile?.verification_status ?? "pending"} className="mt-1" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Verification unlocks business credit, priority support and verified badge.
                </p>
              </>
            )}
          </SectionCard>

          <SectionCard title="Profile completion">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{completion}%</span>
              <span className="text-xs text-muted-foreground">of profile</span>
            </div>
            <Progress value={completion} className="mt-3" />
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/profile">Complete profile</Link>
            </Button>
          </SectionCard>

          <div className="rounded-2xl gradient-brand p-6 text-white shadow-brand">
            <Percent className="h-6 w-6" />
            <h3 className="mt-3 font-display text-lg font-semibold">Business credit</h3>
            <p className="mt-1 text-sm text-white/85">
              Unlock ₹10L in interest-free credit after KYC verification.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" asChild>
              <Link to="/profile">Complete KYC</Link>
            </Button>
          </div>

          <SectionCard title="Recent notifications" action={<Button variant="ghost" size="sm" asChild><Link to="/notifications">All</Link></Button>}>
            <ul className="space-y-3">
              {DEMO_NOTIFICATIONS.slice(0, 3).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground">{n.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
