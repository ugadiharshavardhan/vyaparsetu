import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { AlertTriangle, CreditCard, IndianRupee, Wallet } from "lucide-react";
import { adminOrders, paymentFailures, refundQueue } from "@/data/admin";
import { compactInr, inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [refunds, setRefunds] = useState(refundQueue);
  const paid = adminOrders.filter((o) => o.payment === "paid").reduce((s, o) => s + o.amount, 0);
  const failed = adminOrders.filter((o) => o.payment === "failed").length;
  const upi = adminOrders.filter((o) => o.method === "upi").length;
  const card = adminOrders.filter((o) => o.method === "card").length;

  return (
    <AdminLayout>
      <PageHeader title="Payments" description="Payment transactions, methods and failure analytics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total collected" value={compactInr(paid)} hint="Successful payments" icon={IndianRupee} tone="success" />
        <StatCard label="Failed payments" value={String(failed)} hint="Last 30 days" icon={AlertTriangle} tone="warning" delay={0.05} />
        <StatCard label="UPI transactions" value={String(upi)} hint="Preferred" icon={Wallet} tone="brand" delay={0.1} />
        <StatCard label="Card transactions" value={String(card)} hint="Credit/Debit" icon={CreditCard} tone="info" delay={0.15} />
      </div>

      <SectionCard title="Refund queue" description="Buyer refund requests awaiting action">
        <AdminTable
          rows={refunds}
          getRowId={(r) => r.id}
          searchable={(r) => `${r.id} ${r.buyer} ${r.order}`}
          columns={[
            { key: "id", header: "Refund", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
            { key: "order", header: "Order", render: (r) => <span className="font-mono text-xs">{r.order}</span> },
            { key: "buyer", header: "Buyer", render: (r) => <span className="text-sm">{r.buyer}</span> },
            { key: "amount", header: "Amount", render: (r) => <span className="font-semibold text-sm">{inr(r.amount)}</span> },
            { key: "reason", header: "Reason", render: (r) => <span className="text-sm text-muted-foreground">{r.reason}</span> },
            { key: "status", header: "Status", render: (r) => <Pill tone={r.status === "approved" ? "success" : r.status === "processing" ? "info" : "warning"}>{r.status}</Pill> },
            {
              key: "actions", header: "", className: "text-right", render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => { setRefunds((all) => all.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x))); toast.success("Refund approved"); }}>Approve</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setRefunds((all) => all.filter((x) => x.id !== r.id)); toast.error("Refund declined"); }}>Decline</Button>
                </div>
              ),
            },
          ] as AdminColumn<typeof refunds[number]>[]}
        />
      </SectionCard>

      <SectionCard title="Recent payment failures" description="Diagnose and retry">
        <AdminTable
          rows={paymentFailures}
          getRowId={(p) => p.id}
          searchable={(p) => `${p.id} ${p.order} ${p.reason}`}
          columns={[
            { key: "id", header: "ID", render: (p) => <span className="font-mono text-xs">{p.id}</span> },
            { key: "order", header: "Order", render: (p) => <span className="font-mono text-xs">{p.order}</span> },
            { key: "amount", header: "Amount", render: (p) => <span className="font-semibold text-sm">{inr(p.amount)}</span> },
            { key: "method", header: "Method", render: (p) => <Pill tone="info">{p.method.toUpperCase()}</Pill> },
            { key: "reason", header: "Reason", render: (p) => <span className="text-sm text-destructive">{p.reason}</span> },
            { key: "at", header: "When", render: (p) => <span className="text-xs text-muted-foreground">{new Date(p.at).toLocaleString()}</span> },
          ] as AdminColumn<typeof paymentFailures[number]>[]}
        />
      </SectionCard>

      <SectionCard title="Settlement status" description="Provider integration is a placeholder">
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Live payment gateway integration (Razorpay / Stripe) will be enabled in a future phase.
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
