import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Boxes, ClipboardCheck, Download, Package, PackageCheck,
  ShoppingBag, Sparkles, TrendingUp, Truck, Wallet, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts, useSupplierOrders } from "@/hooks/useSupplier";
import { revenueSeries } from "@/data/supplierSeed";
import { compactInr, inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/")({
  head: () => ({ meta: [{ title: "Seller Workspace — VyaparSetu" }] }),
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaysSales = todaysOrders.reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => o.status === "pending" || o.status === "accepted");
  const readyForPickup = orders.filter((o) => o.status === "packed").length;
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.wholesalePrice, 0);
  const monthly = revenueSeries[revenueSeries.length - 1].revenue;
  const incoming = orders.filter((o) => o.status === "pending" || o.status === "accepted" || o.status === "packed").slice(0, 6);

  return (
    
      <div className="container-page space-y-8 py-8">
        <PageHeader
          title="Seller workspace"
          description="A real-time pulse of your storefront — sales, orders, dispatches and inventory."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success("Report queued")}><Download className="mr-1.5 h-4 w-4" /> Download report</Button>
              <Button asChild><Link to="/supplier/products/new"><Package className="mr-1.5 h-4 w-4" /> Add product</Link></Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Today's sales" value={inr(todaysSales || 18420)} hint="Live" icon={Wallet} tone="brand" />
          <StatCard label="Orders received" value={String(orders.length)} hint="All time" icon={ShoppingBag} tone="info" delay={0.05} />
          <StatCard label="Pending orders" value={String(pending.length)} hint="Action needed" icon={ClipboardCheck} tone="warning" delay={0.1} />
          <StatCard label="Ready for pickup" value={String(readyForPickup)} hint="Dispatch" icon={Truck} tone="warning" delay={0.15} />
          <StatCard label="Inventory value" value={compactInr(inventoryValue)} hint="At cost" icon={Boxes} tone="success" delay={0.2} />
          <StatCard label="Monthly revenue" value={compactInr(monthly)} hint="This month" icon={TrendingUp} tone="brand" delay={0.25} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Incoming orders"
            description="Freshly placed orders awaiting your action"
            className="lg:col-span-2"
            action={<Button variant="ghost" size="sm" asChild><Link to="/supplier/orders">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}
          >
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Order</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incoming.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer}</div>
                        <div className="text-xs text-muted-foreground">{o.destination}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.product} · {o.qty}</td>
                      <td className="px-4 py-3 text-right font-semibold">{inr(o.amount)}</td>
                      <td className="px-4 py-3"><Pill tone={o.status === "pending" ? "warning" : o.status === "packed" ? "info" : "default"}>{o.status}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Inventory overview" description="Stock health across catalog">
            <InventoryOverview products={products} />
          </SectionCard>
        </div>

        <SectionCard title="Quick actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction icon={Package} label="Add product" to="/supplier/products/new" />
            <QuickAction icon={Boxes} label="Manage inventory" to="/supplier/inventory" />
            <QuickAction icon={Truck} label="Dispatch orders" to="/supplier/dispatch" />
            <QuickAction icon={TrendingUp} label="View analytics" to="/supplier/analytics" />
          </div>
        </SectionCard>
      </div>
    
  );
}

function InventoryOverview({ products }: { products: ReturnType<typeof useSupplierProducts>["products"] }) {
  const total = products.length || 1;
  const out = products.filter((p) => p.stock === 0).length;
  const low = products.filter((p) => p.stock > 0 && p.stock < 25).length;
  const medium = products.filter((p) => p.stock >= 25 && p.stock < 100).length;
  const healthy = products.filter((p) => p.stock >= 100).length;

  const rows = [
    { label: "Healthy stock", count: healthy, tone: "bg-success", pct: (healthy / total) * 100 },
    { label: "Medium", count: medium, tone: "bg-warning", pct: (medium / total) * 100 },
    { label: "Low", count: low, tone: "bg-[color:hsl(25_95%_53%)]", pct: (low / total) * 100 },
    { label: "Out of stock", count: out, tone: "bg-destructive", pct: (out / total) * 100 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-display text-2xl font-bold">{products.length}</div>
          <div className="text-xs text-muted-foreground">Live SKUs</div>
        </div>
        <PackageCheck className="h-6 w-6 text-brand" />
      </div>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-semibold">{r.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${r.tone}`} style={{ width: `${r.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="w-full" asChild>
        <Link to="/supplier/inventory"><Sparkles className="mr-1.5 h-4 w-4" /> Manage inventory</Link>
      </Button>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
