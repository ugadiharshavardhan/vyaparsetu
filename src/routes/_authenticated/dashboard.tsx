import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, PackageSearch, ShieldCheck, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { useProfile, useRoles } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VyaparSetu" }] }),
  component: DashboardPage,
});

const KPIS = [
  { label: "Open orders", value: "0", icon: ShoppingCart, hint: "No orders yet" },
  { label: "Delivered", value: "0", icon: Truck, hint: "This month" },
  { label: "Credit available", value: "₹0", icon: CreditCard, hint: "Complete KYC to unlock" },
  { label: "Savings", value: "₹0", icon: TrendingUp, hint: "Vs. local market" },
];

function DashboardPage() {
  const { data: profile, isLoading } = useProfile();
  const { data: roles } = useRoles();

  return (
    <div className="container-page py-10">
      <PageHeader
        title={
          isLoading
            ? "Welcome back"
            : `Welcome back, ${profile?.full_name?.split(" ")[0] ?? "there"} 👋`
        }
        description={
          profile?.business_name
            ? `${profile.business_name} · ${roles?.[0] ?? "Retailer"}`
            : "Your VyaparSetu business dashboard"
        }
        action={
          <Button asChild size="lg" className="shadow-brand">
            <Link to="/marketplace">
              Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <k.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {k.hint}
              </span>
            </div>
            <div className="mt-4 font-display text-2xl font-bold text-foreground">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Recent orders</h2>
              <p className="text-sm text-muted-foreground">Your last 30 days of activity</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">View all</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When you place your first order it will show up here.
            </p>
            <Button asChild size="sm" className="mt-4 shadow-brand">
              <Link to="/marketplace">Start sourcing</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white font-semibold">
                {profile?.business_name?.[0] ?? profile?.full_name?.[0] ?? "V"}
              </div>
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </>
                ) : (
                  <>
                    <div className="truncate font-semibold">{profile?.business_name ?? "Your business"}</div>
                    <div className="truncate text-xs text-muted-foreground">{profile?.email}</div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <VerifiedBadge
                label={profile?.verification_status === "verified" ? "KYC verified" : "KYC pending"}
              />
              <span className="text-muted-foreground">Complete KYC to unlock credit</span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/profile">Manage profile</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-brand/20 gradient-brand p-6 text-white shadow-brand">
            <ShieldCheck className="h-6 w-6" />
            <h3 className="mt-3 font-display text-lg font-semibold">Business credit</h3>
            <p className="mt-1 text-sm text-white/85">
              Unlock ₹10L in interest-free credit after KYC verification.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" asChild>
              <Link to="/profile">Complete KYC</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
