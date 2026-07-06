import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Percent, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { compactInr, inr } from "@/lib/format";
import {
  revenueDaily, revenueMonthly, stateBreakdown, topCategories, userGrowth,
} from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AdminAnalytics,
});

const CHART_COLORS = ["hsl(var(--brand))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

function AdminAnalytics() {
  const totalRev = revenueMonthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = revenueMonthly.reduce((s, m) => s + m.orders, 0);
  const aov = Math.round(totalRev / totalOrders);
  const brandPie = topCategories.slice(0, 5).map((c) => ({ name: c.category, value: c.revenue }));

  return (
    <AdminLayout>
      <PageHeader title="Analytics" description="Revenue, growth, product and geographic insights." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue (YTD)" value={compactInr(totalRev)} hint="Gross" icon={TrendingUp} tone="brand" />
        <StatCard label="Total orders" value={totalOrders.toLocaleString("en-IN")} hint="YTD" icon={ShoppingCart} tone="info" delay={0.05} />
        <StatCard label="Avg. order value" value={inr(aov)} hint="Blended" icon={Percent} tone="success" delay={0.1} />
        <StatCard label="Abandoned cart rate" value="24.6%" hint="7-day rolling" icon={TrendingDown} tone="warning" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Monthly revenue" description="Trend across the fiscal year" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="mo-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand))" strokeWidth={2} fill="url(#mo-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue share" description="Top 5 categories">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={brandPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {brandPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="User growth" description="Buyers vs suppliers">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={userGrowth}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="buyers" stroke="hsl(var(--brand))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="suppliers" stroke="hsl(var(--info))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Orders — daily" description="Last 30 days">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={revenueDaily}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="orders" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top categories" description="By revenue">
          <ul className="divide-y divide-border">
            {topCategories.slice(0, 8).map((c, i) => (
              <li key={c.category} className="flex items-center gap-3 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
                <span className="flex-1 truncate font-medium">{c.category}</span>
                <span className="text-sm text-muted-foreground">{c.orders} orders</span>
                <span className="w-24 text-right font-semibold">{compactInr(c.revenue)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Revenue by state" description="Geographic distribution">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={stateBreakdown} layout="vertical">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="state" tickLine={false} axisLine={false} width={100} className="text-xs" />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="revenue" fill="hsl(var(--info))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Conversion rate" value="3.42%" hint="Visits → orders" icon={Percent} tone="success" />
        <StatCard label="Repeat buyers" value="58.1%" hint="90-day cohort" icon={TrendingUp} tone="brand" delay={0.05} />
        <StatCard label="Traffic sources" value="Direct 42%" hint="Placeholder" icon={ShoppingCart} tone="info" delay={0.1} />
        <StatCard label="Supplier growth" value="+18.4%" hint="MoM" icon={TrendingUp} tone="success" delay={0.15} />
      </div>
    </AdminLayout>
  );
}
