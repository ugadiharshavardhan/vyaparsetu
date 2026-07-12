import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, PackageSearch, RefreshCw, ShoppingCart, Store, TrendingUp, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCardsSkeleton } from "@/components/common/Skeletons";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { PRODUCTS } from "@/data/products";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VyaparSetu" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  const totalOrders = orders.length;
  const pending = orders.filter((o) =>
    ["confirmed", "processing", "packed", "shipped", "out_for_delivery"].includes(o.status),
  );
  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySpend = thisMonth.reduce((s, o) => s + Number(o.grand_total ?? 0), 0);
  const savings = orders.reduce((s, o) => s + Number(o.discount_total ?? 0), 0);
  const recent = orders.slice(0, 3);
  const recommended = PRODUCTS.slice(0, 4);

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {profileLoading
              ? "Welcome back"
              : `Welcome back, ${profile?.owner_name?.split(" ")[0] ?? profile?.full_name?.split(" ")[0] ?? "there"} 👋`}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.business_name ? `${profile.business_name} · Buyer workspace` : "Your VyaparSetu buyer workspace"}
          </p>
        </div>
        <Button asChild size="lg" className="shadow-brand">
          <Link to="/marketplace">Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>

      {ordersLoading ? (
        <div className="mt-8"><StatCardsSkeleton count={4} /></div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total orders" value={String(totalOrders)} hint="All time" icon={ShoppingCart} tone="brand" />
          <StatCard label="Pending deliveries" value={String(pending.length)} hint="In progress" icon={Truck} tone="info" delay={0.05} />
          <StatCard label="Monthly purchases" value={inr(monthlySpend)} hint="This month" icon={Store} tone="success" delay={0.1} />
          <StatCard label="Wholesale savings" value={inr(savings)} hint="Coupons + bulk" icon={TrendingUp} tone="warning" delay={0.15} />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickAction to="/marketplace" icon={Store} label="Browse marketplace" desc="Discover verified suppliers" />
        <QuickAction to="/orders" icon={RefreshCw} label="Reorder products" desc="Repeat past orders in one tap" />
        <QuickAction to="/orders" icon={PackageSearch} label="View orders" desc="Track deliveries live" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Recommended for you"
          description="Bulk deals matched to your business"
          action={<Button variant="outline" size="sm" asChild><Link to="/marketplace">Explore</Link></Button>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group flex gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-brand/40 hover:bg-brand-soft/20"
              >
                <div
                  className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">MOQ {p.moq} {p.unit}</div>
                  <div className="mt-1 text-sm font-bold text-brand">{inr(p.wholesalePrice)}/{p.unit}</div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent orders"
          description="Your latest purchases"
          action={<Button variant="ghost" size="sm" asChild><Link to="/orders">All orders</Link></Button>}
        >
          {ordersLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Once you place your first order it will appear here."
              primaryAction={{ label: "Browse marketplace", href: "/marketplace" }}
              className="border-0 bg-transparent p-0 sm:p-4"
            />
          ) : (
            <div className="space-y-3">
              {recent.map((o) => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="Pending deliveries"
          description="Orders in transit or being prepared"
          action={<Button variant="ghost" size="sm" asChild><Link to="/orders">Track all</Link></Button>}
        >
          {pending.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No pending deliveries"
              description="You're all caught up. New orders will show here."
              className="border-0 bg-transparent p-4"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pending.slice(0, 4).map((o) => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function QuickAction({
  to, icon: Icon, label, desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-elevated"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
