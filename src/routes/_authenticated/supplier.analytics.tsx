import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart
} from "recharts";
import { Package, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { compactInr, inr } from "@/lib/format";
import { useSupplierProducts, useSupplierOrders, useSupplierCustomers } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Supplier" }] }),
  component: AnalyticsPage,
});

const COLORS = ["#16a34a", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

// Generate mock data for the charts
const monthlyRevenueData = [
  { month: "Jan", revenue: 120000 }, { month: "Feb", revenue: 145000 },
  { month: "Mar", revenue: 180000 }, { month: "Apr", revenue: 195000 },
  { month: "May", revenue: 210000 }, { month: "Jun", revenue: 250000 },
  { month: "Jul", revenue: 290000 }, { month: "Aug", revenue: 310000 },
  { month: "Sep", revenue: 340000 }, { month: "Oct", revenue: 420000 },
  { month: "Nov", revenue: 480000 }, { month: "Dec", revenue: 520000 },
];

const salesTrendData = [
  { week: "W1", sales: 45 }, { week: "W2", sales: 52 },
  { week: "W3", sales: 48 }, { week: "W4", sales: 61 },
  { week: "W5", sales: 58 }, { week: "W6", sales: 74 },
];

const categoryShare = [
  { name: "Food & FMCG", value: 45 },
  { name: "Personal Care", value: 20 },
  { name: "Electronics", value: 15 },
  { name: "Home Care", value: 12 },
  { name: "Healthcare", value: 8 },
];

const growthData = [
  { month: "Jul", growth: 15 }, { month: "Aug", growth: 18 },
  { month: "Sep", growth: 22 }, { month: "Oct", growth: 35 },
  { month: "Nov", growth: 42 }, { month: "Dec", growth: 50 },
];

function AnalyticsPage() {
  const { products } = useSupplierProducts();
  const { orders } = useSupplierOrders();
  const { customers } = useSupplierCustomers();
  
  const totalRevenue = monthlyRevenueData.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = 1450; // Mock total orders for realism
  const totalProducts = products.length;
  const totalRetailers = customers.length * 12; // amplify mock retailers

  // Top products calculation based on mock inventory
  const topProducts = products.slice(0, 5).map((p, i) => ({
    name: p.name,
    units: 1200 - (i * 150)
  }));

  const topRetailers = customers.slice(0, 5).map(c => ({
    name: c.business,
    spent: c.spent
  })).sort((a, b) => b.spent - a.spent);

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader title="Business Analytics" description="Actionable insights, revenue trends, and catalog performance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue (YTD)" value={compactInr(totalRevenue)} hint="+24% YoY" icon={TrendingUp} tone="brand" />
        <StatCard label="Total Orders" value={totalOrders.toLocaleString()} hint="+12% YoY" icon={Package} tone="info" delay={0.05} />
        <StatCard label="Active Products" value={totalProducts.toLocaleString()} hint="In catalog" icon={ShoppingBag} tone="success" delay={0.1} />
        <StatCard label="Retailers Reached" value={totalRetailers.toLocaleString()} hint="Across 12 states" icon={Users} tone="warning" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Monthly Revenue" description="Revenue distribution across the year" className="border-border/50 shadow-soft">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue Growth" description="Month-over-month percentage growth" className="border-border/50 shadow-soft">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="growth" stroke="#22c55e" fillOpacity={1} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Category Share" description="Revenue distribution by category" className="lg:col-span-1 border-border/50 shadow-soft">
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {categoryShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Sales Trend" description="Weekly order volume" className="lg:col-span-2 border-border/50 shadow-soft">
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top Products" description="By units sold this year" className="border-border/50 shadow-soft">
          <ul className="space-y-4">
            {topProducts.map((p, i) => (
              <li key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="text-muted-foreground font-semibold">{p.units.toLocaleString()} units</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(p.units / topProducts[0].units) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Top Retailers" description="By total lifetime spend" className="border-border/50 shadow-soft">
          <ul className="space-y-4">
            {topRetailers.map((r, i) => (
              <li key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="truncate font-medium">{r.name}</span>
                  <span className="text-muted-foreground font-semibold">{inr(r.spent)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-success" style={{ width: `${(r.spent / topRetailers[0].spent) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
