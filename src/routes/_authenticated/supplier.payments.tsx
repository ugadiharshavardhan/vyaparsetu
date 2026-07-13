import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Clock, Download, Landmark, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { revenueSeries } from "@/data/supplierSeed";
import { compactInr, inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/payments")({
  head: () => ({ meta: [{ title: "Payments — Seller" }] }),
  component: PaymentsPage,
});

type Payout = {
  id: string;
  reference: string;
  cycle: string;
  orders: number;
  gross: number;
  fees: number;
  net: number;
  status: "paid" | "processing" | "scheduled";
  paidAt: string;
};

function PaymentsPage() {
  const { orders } = useSupplierOrders();
  const gross = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => o.paymentStatus === "pending").reduce((s, o) => s + o.amount, 0);
  const settled = gross - pending;
  const nextPayout = Math.round(settled * 0.18);

  const payouts: Payout[] = [
    { id: "po1", reference: "VS-PYT-2411", cycle: "12 Nov – 18 Nov", orders: 42, gross: 184200, fees: 3684, net: 180516, status: "paid", paidAt: "2026-06-24" },
    { id: "po2", reference: "VS-PYT-2410", cycle: "05 Nov – 11 Nov", orders: 36, gross: 154800, fees: 3096, net: 151704, status: "paid", paidAt: "2026-06-17" },
    { id: "po3", reference: "VS-PYT-2409", cycle: "29 Oct – 04 Nov", orders: 48, gross: 208400, fees: 4168, net: 204232, status: "processing", paidAt: "2026-06-10" },
    { id: "po4", reference: "VS-PYT-2412", cycle: "19 Nov – 25 Nov", orders: 28, gross: 122400, fees: 2448, net: 119952, status: "scheduled", paidAt: "2026-07-02" },
  ];

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Payments"
          description="Track settlements, payouts and GST invoices from a single ledger."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success("Statement downloaded")}><Download className="mr-1.5 h-4 w-4" /> Statement</Button>
              <Button onClick={() => toast.success("GST report queued")}><Receipt className="mr-1.5 h-4 w-4" /> GST report</Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Available balance" value={inr(nextPayout)} hint="Next payout" icon={Wallet} tone="brand" />
          <StatCard label="In processing" value={inr(pending)} hint="Awaiting clearance" icon={Clock} tone="warning" delay={0.05} />
          <StatCard label="Settled (all-time)" value={compactInr(settled + 2140000)} hint="Received" icon={Landmark} tone="success" delay={0.1} />
          <StatCard label="Lifetime revenue" value={compactInr(gross + 2140000)} hint="Gross" icon={TrendingUp} tone="info" delay={0.15} />
        </div>

        <SectionCard title="Payout trend" description="Net settlements over the last 12 months">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="payg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => inr(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--brand))" strokeWidth={2} fill="url(#payg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Payout history" description="7-day settlement cycle">
          <DataTable<Payout>
            rows={payouts}
            columns={[
              { key: "ref", header: "Reference", cell: (p) => <span className="font-semibold">{p.reference}</span> },
              { key: "cycle", header: "Cycle", cell: (p) => <span className="text-sm">{p.cycle}</span> },
              { key: "orders", header: "Orders", cell: (p) => <span className="text-sm">{p.orders}</span> },
              { key: "gross", header: "Gross", cell: (p) => <span className="text-sm">{inr(p.gross)}</span> },
              { key: "fees", header: "Fees", cell: (p) => <span className="text-sm text-muted-foreground">−{inr(p.fees)}</span> },
              { key: "net", header: "Net payout", cell: (p) => <span className="font-semibold">{inr(p.net)}</span> },
              { key: "status", header: "Status", cell: (p) => (
                <Pill tone={p.status === "paid" ? "success" : p.status === "processing" ? "warning" : "info"}>{p.status}</Pill>
              )},
              { key: "date", header: "Date", cell: (p) => <span className="text-sm text-muted-foreground">{new Date(p.paidAt).toLocaleDateString("en-IN")}</span> },
            ]}
          />
        </SectionCard>
      </div>
    
  );
}
