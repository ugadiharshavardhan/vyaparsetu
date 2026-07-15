import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  History,
  PackageSearch,
  RefreshCw,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Sparkles,
  TrendingUp as TrendingIcon,
  Box,
  Loader2,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCardsSkeleton } from "@/components/common/Skeletons";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { CategoryGrid } from "@/components/marketplace/CategoryGrid";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/hooks/useCart";
import { useCartRelatedProducts } from "@/hooks/useCatalog";
import { inr } from "@/lib/format";
import type { Order } from "@/types/commerce";

export const Route = createFileRoute("/_authenticated/buyer/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VyaparSetu" }] }),
  pendingComponent: () => (
    <div className="container-page space-y-6 py-8">
      <StatCardsSkeleton />
    </div>
  ),
  component: DashboardPage,
});

const PENDING_STATUSES = new Set([
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "pending",
]);

const PREVIOUS_STATUSES = new Set([
  "delivered",
  "cancelled",
  "returned",
  "return_requested",
]);

function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: cartItems = [] } = useCart();

  const totalOrders = orders.length;
  const pending = orders.filter((o) => PENDING_STATUSES.has(o.status));
  const previousOrders = orders.filter((o) => PREVIOUS_STATUSES.has(o.status));
  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlySpend = thisMonth.reduce((s, o) => s + Number(o.grand_total ?? 0), 0);
  const savings = orders.reduce((s, o) => s + Number(o.discount_total ?? 0), 0);
  const recent = orders.slice(0, 3);

  const cartActive = cartItems.filter((i) => !i.saved_for_later);
  const cartExcludeIds = useMemo(() => cartActive.map((i) => i.product_id), [cartActive]);
  const cartCategories = useMemo(() => {
    const fromCart = cartActive
      .map((i) => i.product_snapshot?.category)
      .filter((c): c is string => !!c && c.trim().length > 0);
    // Also hint from previous order line items when cart is empty
    const fromOrders = previousOrders.flatMap((o) =>
      (o.order_items ?? []).map((li) => {
        const snap = li.product_snapshot as { category?: string } | undefined;
        return snap?.category ?? "";
      }),
    );
    return Array.from(new Set([...fromCart, ...fromOrders].filter(Boolean))).slice(0, 4);
  }, [cartActive, previousOrders]);

  const { data: recommended = [], isLoading: recommendedLoading } = useCartRelatedProducts({
    excludeIds: cartExcludeIds,
    categoryHints: cartCategories,
    limit: 8,
    enabled: cartCategories.length > 0 || cartExcludeIds.length > 0,
  });

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {profileLoading
              ? "Welcome back"
              : `Welcome back, ${profile?.owner_name?.split(" ")[0] ?? profile?.full_name?.split(" ")[0] ?? "there"}`}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.business_name
              ? `${profile.business_name} · Buyer workspace`
              : "Your VyaparSetu buyer workspace"}
          </p>
        </div>
        <Button asChild size="lg" className="shadow-brand">
          <Link to="/marketplace">
            Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {ordersLoading ? (
        <div className="mt-8">
          <StatCardsSkeleton count={4} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total orders" value={String(totalOrders)} hint="All time" icon={ShoppingCart} tone="brand" />
          <StatCard
            label="Pending deliveries"
            value={String(pending.length)}
            hint="In progress"
            icon={Truck}
            tone="info"
            delay={0.05}
          />
          <StatCard
            label="Monthly purchases"
            value={inr(monthlySpend)}
            hint="This month"
            icon={Store}
            tone="success"
            delay={0.1}
          />
          <StatCard
            label="Wholesale savings"
            value={inr(savings)}
            hint="Coupons + bulk"
            icon={TrendingUp}
            tone="warning"
            delay={0.15}
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickAction to="/marketplace" icon={Store} label="Browse marketplace" desc="Discover verified suppliers" />
        <QuickAction to="/orders" icon={RefreshCw} label="Reorder products" desc="Repeat past orders in one tap" />
        <QuickAction to="/orders" icon={PackageSearch} label="View orders" desc="Track deliveries live" />
      </div>

      {/* Previous orders — dedicated history */}
      <div className="mt-10">
        <SectionCard
          title="Previous orders"
          description="Orders you have already completed or closed — reorder anytime"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">
                <History className="mr-1.5 h-4 w-4" /> All orders
              </Link>
            </Button>
          }
        >
          {ordersLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : previousOrders.length === 0 ? (
            <EmptyState
              icon={History}
              title="No previous orders yet"
              description="After you place and complete orders, they will show up here."
              primaryAction={{ label: "Browse marketplace", href: "/marketplace" }}
              className="border-0 bg-transparent p-0 sm:p-4"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {previousOrders.slice(0, 6).map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="Pending deliveries"
          description="Orders in transit or being prepared"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">Track all</Link>
            </Button>
          }
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
              {pending.slice(0, 4).map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="Recent activity"
          description="Your latest purchases across all statuses"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">All orders</Link>
            </Button>
          }
        >
          {ordersLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
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
              {recent.map((o: Order) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recommendations from cart / order categories */}
      <div className="mt-10">
        <SectionCard
          title="You might also like"
          description={
            cartCategories.length
              ? "Suggested from the same categories as your cart and past orders"
              : "Bulk deals matched to popular wholesale categories"
          }
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/marketplace">Explore</Link>
            </Button>
          }
        >
          {recommendedLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-brand" /> Loading suggestions…
            </div>
          ) : recommended.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Add items to your cart"
              description="We'll suggest more products from the same categories."
              primaryAction={{ label: "Browse marketplace", href: "/marketplace" }}
              className="border-0 bg-transparent p-4"
            />
          ) : (
            <ProductGrid products={recommended} />
          )}
        </SectionCard>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          <h2 className="font-display text-xl font-bold">Business insights</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-brand">
              <Box className="h-5 w-5" />
              <h3 className="font-semibold">Suggested restock</h3>
            </div>
            <p className="mb-4 text-sm text-foreground/80">
              Keep fast-moving wholesale SKUs stocked. Review your previous orders and reorder in one tap.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-brand/40 text-brand hover:bg-brand hover:text-white"
              asChild
            >
              <Link to="/orders">View previous orders</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-info/20 bg-info/10 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-info">
              <TrendingIcon className="h-5 w-5" />
              <h3 className="font-semibold">Explore marketplace</h3>
            </div>
            <p className="mb-4 text-sm text-foreground/80">
              Discover verified suppliers and categories matched to your buying patterns.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-info/40 text-info hover:bg-info hover:text-white"
              asChild
            >
              <Link to="/marketplace">Browse now</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <CategoryGrid
          title="Shop by category"
          description="Wholesale business categories for your restock — Food & FMCG, Healthcare, Electronics and more."
        />
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  desc,
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
