import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Banknote, IndianRupee, Percent, TrendingUp } from "lucide-react";
import { gstReports, revenueMonthly, supplierPayouts } from "@/data/admin";
import { compactInr, inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  head: () => ({ meta: [{ title: "Finance — Admin" }] }),
  component: FinancePage,
});

function FinancePage() {
  const gross = revenueMonthly.reduce((s, m) => s + m.revenue, 0);
  const commission = Math.round(gross * 0.08);
  const totalPayout = supplierPayouts.reduce((s, p) => s + p.net, 0);
  const gstCollected = gstReports.reduce((s, m) => s + m.cgst + m.sgst + m.igst, 0);

  return (
    <AdminLayout>
      <PageHeader title="Finance" description="Revenue, commission, payouts and GST reporting." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross revenue (YTD)" value={compactInr(gross)} hint="Platform GMV" icon={IndianRupee} tone="brand" />
        <StatCard label="Commission earned" value={compactInr(commission)} hint="~8% take-rate" icon={Percent} tone="success" delay={0.05} />
        <StatCard label="Total payouts" value={compactInr(totalPayout)} hint="To suppliers" icon={Banknote} tone="info" delay={0.1} />
        <StatCard label="GST collected" value={compactInr(gstCollected)} hint="YTD" icon={TrendingUp} tone="warning" delay={0.15} />
      </div>

      <SectionCard title="Monthly GST breakdown" description="CGST / SGST / IGST">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={gstReports}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar dataKey="cgst" stackId="a" fill="hsl(var(--brand))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sgst" stackId="a" fill="hsl(var(--info))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="igst" stackId="a" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Supplier payouts" description="Scheduled and processed transfers">
        <AdminTable
          rows={supplierPayouts}
          getRowId={(p) => p.id}
          searchable={(p) => `${p.id} ${p.supplier}`}
          columns={[
            { key: "id", header: "Payout", render: (p) => <span className="font-mono text-xs">{p.id}</span> },
            { key: "supplier", header: "Supplier", render: (p) => <span className="font-medium text-sm">{p.supplier}</span> },
            { key: "gross", header: "Gross", render: (p) => <span className="text-sm">{inr(p.gross)}</span> },
            { key: "commission", header: "Commission", render: (p) => <span className="text-sm text-muted-foreground">{inr(p.commission)}</span> },
            { key: "net", header: "Net payout", render: (p) => <span className="text-sm font-semibold">{inr(p.net)}</span> },
            { key: "scheduled", header: "Date", render: (p) => <span className="text-xs text-muted-foreground">{new Date(p.scheduled).toLocaleDateString()}</span> },
            { key: "status", header: "Status", render: (p) => (
              <Pill tone={p.status === "processed" ? "success" : p.status === "scheduled" ? "info" : "warning"}>
                {p.status.replace("_", " ")}
              </Pill>
            ) },
          ] as AdminColumn<typeof supplierPayouts[number]>[]}
        />
      </SectionCard>

      <SectionCard title="Monthly statement" description="Revenue vs orders">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={revenueMonthly}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis yAxisId="l" tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar yAxisId="l" dataKey="revenue" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="r" dataKey="orders" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
