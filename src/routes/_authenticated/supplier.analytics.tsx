import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { LineChart as LineIcon, Package, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { revenueSeries, categoryShare } from "@/data/supplierSeed";
import { compactInr, inr } from "@/lib/format";
import { useSupplierProducts, useSupplierOrders } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Supplier" }] }),
  component: AnalyticsPage,
});

const COLORS = ["hsl(var(--brand))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

function AnalyticsPage() {
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();
  const totalRevenue = revenueSeries.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = revenueSeries.reduce((s, r) => s + r.orders, 0);
  const avg = totalRevenue / totalOrders;
  const conversion = 4.8;

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Analytics" description="Deep-dive into revenue, catalog velocity and customer growth." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue (12M)" value={compactInr(totalRevenue)} hint="Trailing year" icon={TrendingUp} tone="brand" />
          <StatCard label="Orders (12M)" value={String(totalOrders)} hint="Fulfilled" icon={Package} tone="info" delay={0.05} />
          <StatCard label="Avg order value" value={inr(avg)} hint="AOV" icon={LineIcon} tone="success" delay={0.1} />
          <StatCard label="Conversion" value={`${conversion}%`} hint="Visitors → order" icon={Users} tone="warning" delay={0.15} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Monthly sales" description="Revenue by month" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={revenueSeries}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--brand))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Category share" description="Revenue distribution">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {categoryShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Order growth" description="Order count trend">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={revenueSeries}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--brand))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Top products by units sold" description="Movers in the last 30 days">
            <ul className="space-y-2">
              {products.slice(0, 5).map((p, i) => {
                const units = orders.filter((o) => o.product === p.name).reduce((s, o) => s + o.qty, 0) || 8 + i * 6;
                const width = Math.min(100, (units / 50) * 100);
                return (
                  <li key={p.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{units} units</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Visitor traffic" description="Placeholder — will connect to analytics provider">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Store visits", value: "24,812" },
              { label: "Product views", value: "82,410" },
              { label: "Bounce rate", value: "38%" },
              { label: "Avg session", value: "3m 42s" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="mt-1 font-display text-xl font-bold">{m.value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    
  );
}
