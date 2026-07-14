import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Bell, Boxes, Building2, CheckCircle2, Clock,
  Package, ReceiptText, ShieldCheck, ShoppingBag, TrendingUp, Users, Wallet,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { compactInr, inr } from "@/lib/format";
import {
  adminOrders, adminTickets, adminUsers, auditLogs,
  refundQueue, revenueDaily, verificationQueue,
} from "@/data/admin";
import { useProducts } from "@/hooks/useCatalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — VyaparSetu" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: catalogProducts = [] } = useProducts();
  const totalUsers = adminUsers.length;
  const activeUsers = adminUsers.filter((u) => u.status === "active").length;
  const retailers = adminUsers.filter((u) => u.role === "retailer").length;
  const manufacturers = adminUsers.filter((u) => u.role === "manufacturer").length;
  const wholesalers = adminUsers.filter((u) => u.role === "wholesaler").length;
  const distributors = adminUsers.filter((u) => u.role === "distributor").length;
  const verified = adminUsers.filter((u) => u.gstVerified).length;
  const pendingVer = verificationQueue.filter((v) => v.status === "pending").length;
  const totalProducts = catalogProducts.length;
  const pendingProd = catalogProducts.filter((p) => !p.inStock).length;
  const today = new Date().toDateString();
  const ordersToday = adminOrders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const monthlyRev = adminOrders.reduce((s, o) => s + o.amount, 0);
  const commission = Math.round(monthlyRev * 0.08);
  const cancelled = adminOrders.filter((o) => o.status === "cancelled").length;
  const openTickets = adminTickets.filter((t) => t.status === "open" || t.status === "escalated").length;
  const pendingRefunds = refundQueue.filter((r) => r.status === "pending").length;

  return (
    <AdminLayout>
      <PageHeader
        title="Platform overview"
        description="Real-time snapshot of VyaparSetu's operations, users and finance."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/admin/reports">Reports</Link></Button>
            <Button asChild><Link to="/admin/analytics">Analytics</Link></Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={String(totalUsers)} hint="All roles" icon={Users} tone="brand" />
        <StatCard label="Active users" value={String(activeUsers)} hint="Last 30 days" icon={Activity} tone="success" delay={0.05} />
        <StatCard label="Verified businesses" value={String(verified)} hint="GST cleared" icon={CheckCircle2} tone="success" delay={0.1} />
        <StatCard label="Pending verifications" value={String(pendingVer)} hint="Action needed" icon={Clock} tone="warning" delay={0.15} />

        <StatCard label="Retailers" value={String(retailers)} hint="Buyers" icon={ShoppingBag} tone="info" delay={0.2} />
        <StatCard label="Wholesalers" value={String(wholesalers)} hint="Suppliers" icon={Building2} tone="info" delay={0.25} />
        <StatCard label="Manufacturers" value={String(manufacturers)} hint="Suppliers" icon={Building2} tone="info" delay={0.3} />
        <StatCard label="Distributors" value={String(distributors)} hint="Suppliers" icon={Building2} tone="info" delay={0.35} />

        <StatCard label="Total products" value={String(totalProducts)} hint="Catalog" icon={Boxes} tone="brand" delay={0.4} />
        <StatCard label="Pending approvals" value={String(pendingProd)} hint="Review" icon={Package} tone="warning" delay={0.45} />
        <StatCard label="Orders today" value={String(ordersToday)} hint="Live" icon={ReceiptText} tone="brand" delay={0.5} />
        <StatCard label="Monthly revenue" value={compactInr(monthlyRev)} hint="Gross GMV" icon={TrendingUp} tone="success" delay={0.55} />

        <StatCard label="Platform commission" value={compactInr(commission)} hint="This month" icon={Wallet} tone="success" delay={0.6} />
        <StatCard label="Cancelled orders" value={String(cancelled)} hint="Last 30 days" icon={AlertTriangle} tone="warning" delay={0.65} />
        <StatCard label="Open tickets" value={String(openTickets)} hint="Support" icon={Bell} tone="warning" delay={0.7} />
        <StatCard label="Pending refunds" value={String(pendingRefunds)} hint="Finance" icon={ShieldCheck} tone="info" delay={0.75} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Revenue — last 30 days" description="Daily gross merchandise value" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={revenueDaily}>
                <defs>
                  <linearGradient id="ov-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand))" strokeWidth={2} fill="url(#ov-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="System health" description="All services nominal">
          <div className="space-y-3">
            <HealthRow label="API gateway" tone="success" hint="99.98% uptime" />
            <HealthRow label="Database" tone="success" hint="42ms p95" />
            <HealthRow label="Payments" tone="success" hint="Razorpay OK" />
            <HealthRow label="Search" tone="warning" hint="Reindexing" />
            <HealthRow label="Email delivery" tone="success" hint="98% delivered" />
            <HealthRow label="Storage" tone="success" hint="63% capacity" />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Orders by status" description="Last 30 days" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={statusBuckets()}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="status" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="hsl(var(--brand))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="Audit log">
          <ul className="space-y-2">
            {auditLogs.slice(0, 6).map((log) => (
              <li key={log.id} className="flex gap-3 rounded-xl border border-border p-3 text-sm">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{log.action}</div>
                  <div className="text-xs text-muted-foreground">{log.actor} · {log.target}</div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}

function statusBuckets() {
  const counts = new Map<string, number>();
  for (const o of adminOrders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

function HealthRow({ label, tone, hint }: { label: string; tone: "success" | "warning" | "danger"; hint: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <Pill tone={tone}>{tone === "success" ? "Healthy" : tone === "warning" ? "Degraded" : "Down"}</Pill>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </div>
  );
}
