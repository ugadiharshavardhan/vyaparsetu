import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Boxes, ClipboardCheck, Download, Package, PackageCheck,
  ShoppingBag, Sparkles, TrendingUp, Wallet, ArrowUpRight, Box, BarChart3,
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

export const Route = createFileRoute("/_authenticated/seller/dashboard")({
  head: () => ({ meta: [{ title: "Seller Workspace — VyaparSetu" }] }),
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todaysSales = todaysOrders.reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => o.status === "pending" || o.status === "accepted");
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.wholesalePrice, 0);
  const monthly = revenueSeries[revenueSeries.length - 1].revenue;
  const incoming = orders.filter((o) => o.status === "pending" || o.status === "accepted" || o.status === "packed").slice(0, 6);

  return (
    <div className="container-page space-y-8 py-8">
        <PageHeader
          title="Seller workspace"
          description="A real-time pulse of your storefront — sales, orders, and inventory."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success("Report queued")}><Download className="mr-1.5 h-4 w-4" /> Download report</Button>
              <Button asChild><Link to="/supplier/products/new"><Package className="mr-1.5 h-4 w-4" /> Add product</Link></Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Today's sales" value={inr(todaysSales || 18420)} hint="Live" icon={Wallet} tone="brand" />
          <StatCard label="Orders received" value={String(orders.length)} hint="All time" icon={ShoppingBag} tone="info" delay={0.05} />
          <StatCard label="Pending orders" value={String(pending.length)} hint="Action needed" icon={ClipboardCheck} tone="warning" delay={0.1} />
          <StatCard label="Inventory value" value={compactInr(inventoryValue)} hint="At cost" icon={Boxes} tone="success" delay={0.15} />
          <StatCard label="Monthly revenue" value={compactInr(monthly)} hint="This month" icon={TrendingUp} tone="brand" delay={0.2} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2 p-0 overflow-hidden border-border/50 shadow-soft">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4 bg-muted/5 rounded-t-2xl">
              <div>
                <h3 className="font-semibold text-base text-foreground">Incoming orders</h3>
                <p className="text-xs text-muted-foreground mt-1">Freshly placed orders awaiting your action</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 rounded-full border-border/60 text-xs hover:bg-muted/40" asChild>
                <Link to="/supplier/orders">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/85 border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">Order</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5 text-right">Value</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incoming.map((o) => (
                    <tr 
                      key={o.id} 
                      className="hover:bg-muted/10 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate({ to: "/supplier/orders/$id", params: { id: o.id } })}
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">{o.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{o.customer}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{o.destination}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{o.product} · {o.qty} items</td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">{inr(o.amount)}</td>
                      <td className="px-6 py-4"><Pill tone={o.status === "pending" ? "warning" : o.status === "packed" ? "info" : "default"}>{o.status}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Inventory overview" description="Stock health across catalog" className="border-border/50 shadow-soft">
            <InventoryOverview products={products} />
          </SectionCard>
        </div>

        {/* AI Business Insights */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-bold font-display">AI Business Insights</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-success-soft bg-success-soft/30 p-6 shadow-sm hover:shadow-soft transition-all duration-200">
              <div className="mb-3 flex items-center gap-2 text-success">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Fast Moving Products</h3>
              </div>
              <p className="text-sm text-foreground/80 mb-4">
                <strong>Parle-G Glucose Biscuits</strong> are selling 40% faster this week. Ensure you have enough inventory to fulfill upcoming RFQs.
              </p>
              <Button size="sm" variant="outline" className="border-success/40 text-[hsl(var(--success))] hover:bg-success hover:text-white rounded-full h-8" asChild>
                <Link to="/supplier/inventory">View Stock</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-warning-soft bg-warning-soft/30 p-6 shadow-sm hover:shadow-soft transition-all duration-200">
              <div className="mb-3 flex items-center gap-2 text-[hsl(var(--warning))]">
                <Box className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Low Stock Warning</h3>
              </div>
              <p className="text-sm text-foreground/80 mb-4">
                You have 3 items running low on stock (below 25 units). Replenish <strong>Tata Salt 1kg</strong> to avoid missing bulk orders.
              </p>
              <Button size="sm" variant="outline" className="border-warning/40 text-[hsl(var(--warning))] hover:bg-warning hover:text-white rounded-full h-8" asChild>
                <Link to="/supplier/inventory">Restock Now</Link>
              </Button>
            </div>
          </div>
        </div>

        <SectionCard title="Quick actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction icon={Package} label="Add product" to="/supplier/products/new" />
            <QuickAction icon={Boxes} label="Manage inventory" to="/supplier/inventory" />
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
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
      className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-brand/40 hover:bg-muted/5 hover:shadow-soft"
    >
      <div className="flex items-center gap-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
        <span className="text-sm font-semibold text-foreground/90">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
