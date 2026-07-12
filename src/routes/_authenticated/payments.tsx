import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, CreditCard, Download, Receipt, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardsSkeleton, TableSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill } from "@/components/supplier/Pill";
import { useOrders } from "@/hooks/useOrders";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — VyaparSetu" }] }),
  component: BuyerPaymentsPage,
});

const METHOD_LABEL: Record<string, string> = {
  upi: "UPI", card: "Card", netbanking: "Net Banking", cod: "Cash on Delivery", wallet: "Wallet",
};

function BuyerPaymentsPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  const rows = useMemo(() => orders.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    date: o.created_at,
    amount: Number(o.grand_total ?? 0),
    method: o.payment_method ?? "upi",
    status: o.payment_status ?? "pending",
  })), [orders]);

  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (q && !r.order_number.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const total = rows.length;
  const outstanding = rows.filter((r) => r.status !== "success").reduce((s, r) => s + r.amount, 0);
  const completed = rows.filter((r) => r.status === "success").reduce((s, r) => s + r.amount, 0);

  const downloadInvoice = (orderNumber: string) => {
    toast.success(`GST invoice for ${orderNumber} downloaded`);
  };

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader
        title="Payments"
        description="Track every transaction, method and GST invoice in one place."
      />

      {isLoading ? (
        <StatCardsSkeleton count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total transactions" value={String(total)} hint="All time" icon={CreditCard} tone="brand" />
          <StatCard label="Outstanding" value={inr(outstanding)} hint="Pending clearance" icon={Clock} tone="warning" delay={0.05} />
          <StatCard label="Completed payments" value={inr(completed)} hint="Received" icon={CheckCircle2} tone="success" delay={0.1} />
        </div>
      )}

      <SectionCard
        title="Payment history"
        description="Every invoice and receipt"
        action={<Button variant="outline" size="sm" onClick={() => toast.success("Statement downloaded")}><Download className="mr-1.5 h-3.5 w-3.5" /> Statement</Button>}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="success">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search order #" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions yet"
            description="Your payment history will appear here once you place an order."
            primaryAction={{ label: "Browse marketplace", href: "/marketplace" }}
            className="border-0 bg-transparent"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="max-h-[560px] overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link to="/orders/$id" params={{ id: r.id }} className="font-semibold text-brand hover:underline">
                          {r.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{inr(r.amount)}</td>
                      <td className="px-4 py-3">{METHOD_LABEL[r.method] ?? r.method}</td>
                      <td className="px-4 py-3">
                        <Pill tone={r.status === "success" ? "success" : r.status === "failed" ? "danger" : "warning"}>
                          {r.status === "success" ? "Paid" : r.status}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => downloadInvoice(r.order_number)}>
                          <Receipt className="mr-1.5 h-3.5 w-3.5" /> GST Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
