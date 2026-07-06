import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Bell, Boxes, ClipboardCheck, LineChart, Package, PackageCheck,
  ReceiptText, ShoppingBag, Sparkles, Star, TrendingUp, Wallet,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts, useSupplierOrders, useSupplierNotifications } from "@/hooks/useSupplier";
import { revenueSeries } from "@/data/supplierSeed";
import { compactInr, inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/")({
  head: () => ({ meta: [{ title: "Supplier Dashboard — VyaparSetu" }] }),
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();
  const { notifications } = useSupplierNotifications();

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const pending = orders.filter((o) => o.status === "pending" || o.status === "accepted").length;
  const completed = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.amount, 0);
  const monthly = revenueSeries[revenueSeries.length - 1].revenue;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 25).length;
  const outStock = products.filter((p) => p.stock === 0).length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const topProducts = [...products]
    .map((p) => {
      const soldQty = orders.filter((o) => o.product === p.name).reduce((s, o) => s + o.qty, 0);
      const soldAmt = orders.filter((o) => o.product === p.name).reduce((s, o) => s + o.amount, 0);
      return { p, soldQty, soldAmt };
    })
    .sort((a, b) => b.soldAmt - a.soldAmt)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="container-page space-y-8 py-8">
        <PageHeader
          title="Supplier dashboard"
          description="A real-time pulse of your storefront, inventory and fulfilment."
          action={
            <div className="flex gap-2">
              <Button variant="outline" asChild><Link to="/supplier/orders">View orders</Link></Button>
              <Button asChild><Link to="/supplier/products/new">Add product</Link></Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's orders" value={String(todaysOrders)} hint="Live" icon={ShoppingBag} tone="brand" />
          <StatCard label="Pending orders" value={String(pending)} hint="Action needed" icon={ClipboardCheck} tone="warning" delay={0.05} />
          <StatCard label="Completed orders" value={String(completed)} hint="Fulfilled" icon={PackageCheck} tone="success" delay={0.1} />
          <StatCard label="Revenue (all time)" value={compactInr(revenue + 2140000)} hint="Gross" icon={Wallet} tone="info" delay={0.15} />
          <StatCard label="Monthly revenue" value={compactInr(monthly)} hint="This month" icon={TrendingUp} tone="brand" delay={0.2} />
          <StatCard label="Total products" value={String(products.length)} hint="Live SKUs" icon={Package} tone="info" delay={0.25} />
          <StatCard label="Low stock" value={String(lowStock)} hint="Restock soon" icon={Boxes} tone="warning" delay={0.3} />
          <StatCard label="Out of stock" value={String(outStock)} hint="Blocked" icon={Boxes} tone={outStock ? "warning" : "success"} delay={0.35} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Revenue trend" description="Monthly revenue vs order volume" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => inr(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand))" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Business status" description="Verification & performance">
            <div className="space-y-3">
              <StatusRow label="Business verification" value={<Pill tone="success">Verified</Pill>} />
              <StatusRow label="GST verification" value={<Pill tone="success">Verified</Pill>} />
              <StatusRow label="Avg. rating" value={<span className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.7</span>} />
              <StatusRow label="Response rate" value={<span className="font-semibold">98%</span>} />
              <StatusRow label="On-time delivery" value={<span className="font-semibold">96%</span>} />
              <StatusRow label="Notifications" value={<Pill tone={unreadNotifs ? "warning" : "muted"}>{unreadNotifs} new</Pill>} />
              <StatusRow label="Pending approvals" value={<Pill tone="muted">0</Pill>} />
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Top-selling products" description="Ranked by revenue" className="lg:col-span-2">
            <ul className="divide-y divide-border">
              {topProducts.map(({ p, soldQty, soldAmt }, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 py-3"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
                  <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} • SKU {p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{inr(soldAmt || p.wholesalePrice * 12)}</div>
                    <div className="text-xs text-muted-foreground">{soldQty || 12} units</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Recent activity" description="What's happening right now">
            <ul className="space-y-3">
              {notifications.slice(0, 6).map((n) => (
                <li key={n.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Quick actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction icon={Package} label="Add product" to="/supplier/products/new" />
            <QuickAction icon={Boxes} label="Adjust inventory" to="/supplier/inventory" />
            <QuickAction icon={ReceiptText} label="Manage orders" to="/supplier/orders" />
            <QuickAction icon={Sparkles} label="Create promotion" to="/supplier/promotions" />
            <QuickAction icon={LineChart} label="View analytics" to="/supplier/analytics" />
            <QuickAction icon={Star} label="Reply to reviews" to="/supplier/reviews" />
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}

function StatusRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to: string }) {
  return (
    <a
      href={to}
      className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

