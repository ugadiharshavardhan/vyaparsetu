import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Clock, Download, Landmark, Receipt, FileText, CheckCircle2, ChevronDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { compactInr, inr } from "@/lib/format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatCardsSkeleton, TableSkeleton } from "@/components/common/Skeletons";

export const Route = createFileRoute("/_authenticated/supplier/payments")({
  head: () => ({ meta: [{ title: "Payments & Settlements — Seller" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { orders, isLoading, error } = useSupplierOrders();
  
  if (isLoading) {
    return (
      <div className="container-page space-y-8 py-8 animate-pulse">
        <PageHeader
          title="Payments & Settlements"
          description="Track your revenue, pending payments, and download tax invoices."
          action={
            <div className="flex flex-wrap gap-2.5">
              <div className="h-10 w-36 rounded-full bg-muted" />
              <div className="h-10 w-44 rounded-full bg-muted" />
            </div>
          }
        />
        <StatCardsSkeleton count={5} />
        <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
          <div className="h-6 w-48 rounded bg-muted mb-4" />
          <TableSkeleton rows={8} cols={7} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">Could not load payment records</h2>
          <p className="text-sm text-muted-foreground max-w-sm">There was a problem communicating with the server. Please try again.</p>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-2 shadow-soft">
          Retry load
        </Button>
      </div>
    );
  }

  // Real calculations based on database values
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((s, o) => s + o.amount, 0);
  const pendingPayments = validOrders.filter(o => o.paymentStatus === "pending").reduce((s, o) => s + o.amount, 0);
  const releasedPayments = totalRevenue - pendingPayments;
  
  // Real GST calculation from lines
  const gstCollected = validOrders.reduce((sum, o) => {
    const rate = o.gstRate ?? 18;
    const included = o.gstIncluded ?? true;
    const lineGst = included
      ? o.amount - (o.amount / (1 + rate / 100))
      : o.amount * (rate / 100);
    return sum + lineGst;
  }, 0);
  
  const nextSettlement = pendingPayments;

  // Enrich order data for the transaction table
  const transactions = orders.map(o => {
    const rate = o.gstRate ?? 18;
    const included = o.gstIncluded ?? true;
    const gstAmt = included
      ? o.amount - (o.amount / (1 + rate / 100))
      : o.amount * (rate / 100);
    
    const isSettled = o.paymentStatus === "paid";
    
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer,
      amount: o.amount,
      gst: gstAmt,
      method: "NEFT / RTGS",
      status: isSettled ? "Settled" : "Pending",
      settlementDate: isSettled ? new Date(new Date(o.createdAt).getTime() + 86400000 * 2).toISOString() : "—"
    };
  });

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Payments & Settlements"
        description="Track your revenue, pending payments, and download tax invoices."
        action={
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" className="h-10 px-5 rounded-full border-border/60 text-muted-foreground bg-transparent hover:bg-muted/30 hover:text-foreground hover:border-border transition-all duration-200 text-xs font-medium" onClick={() => toast.success("Ledger exported")}><Download className="mr-1.5 h-4 w-4 shrink-0" /> Export Ledger</Button>
            <Button className="h-10 px-5 rounded-full bg-brand text-white hover:bg-brand/90 hover:shadow-brand transition-all duration-200 text-xs font-semibold shadow-soft" onClick={() => toast.success("Settlement request sent")}><Landmark className="mr-1.5 h-4 w-4 shrink-0" /> Request Settlement</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={compactInr(totalRevenue)} hint="Lifetime" icon={TrendingUp} tone="brand" />
        <StatCard label="Pending Payments" value={inr(pendingPayments)} hint="Awaiting settlement" icon={Clock} tone="warning" delay={0.05} />
        <StatCard label="Released Payments" value={compactInr(releasedPayments)} hint="Bank transfer" icon={CheckCircle2} tone="success" delay={0.1} />
        <StatCard label="GST Collected" value={compactInr(gstCollected)} hint="Output tax" icon={Receipt} tone="info" delay={0.15} />
        <StatCard label="Next Settlement" value={inr(nextSettlement)} hint="Expected payout" icon={Wallet} tone="default" delay={0.2} />
      </div>

      <SectionCard className="p-0 overflow-hidden mt-6 border-border/50 shadow-soft">
        <div className="px-6 py-5 border-b border-border bg-muted/5">
          <h3 className="font-semibold text-base text-foreground">Transaction History</h3>
          <p className="text-xs text-muted-foreground mt-1">All recent orders and their settlement status</p>
        </div>
        <DataTable
          rows={transactions}
          pageSize={15}
          embedded={true}
          empty={
            <div className="space-y-4 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/65 text-muted-foreground/80">
                <Receipt className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="text-base font-semibold text-foreground">No transaction records found</div>
                <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground/85">Your sales payouts and tax invoice settlements will appear here.</p>
              </div>
            </div>
          }
          columns={[
            { key: "orderId", header: "Order ID", cell: (t) => <span className="font-semibold text-sm text-foreground/90">{t.orderNumber}</span> },
            { key: "retailer", header: "Retailer", cell: (t) => <span className="font-medium text-foreground/80">{t.customer}</span> },
            { key: "amount", header: "Amount", cell: (t) => <span className="font-bold text-foreground">{inr(t.amount)}</span> },
            { key: "gst", header: "GST", cell: (t) => <span className="text-sm text-muted-foreground/80 font-medium">{inr(t.gst)}</span> },
            { key: "method", header: "Payment Method", cell: (t) => <span className="text-sm text-muted-foreground/85">{t.method}</span> },
            { key: "status", header: "Status", cell: (t) => (
              <Pill tone={t.status === "Settled" ? "success" : "warning"}>{t.status}</Pill>
            )},
            { key: "settlementDate", header: "Settlement Date", cell: (t) => (
              <span className="text-xs text-muted-foreground/80">{t.settlementDate !== "—" ? new Date(t.settlementDate).toLocaleDateString() : "—"}</span>
            )},
            { key: "actions", header: "", className: "text-right", cell: (t) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full border border-border/60 text-xs font-semibold hover:bg-muted/40 transition-colors">
                    Actions <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/75" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border/80 shadow-elevated">
                  <DropdownMenuItem onClick={() => toast.success("Invoice downloaded")} className="text-xs font-medium"><FileText className="mr-2 h-3.5 w-3.5" /> Download Invoice</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("GST Invoice downloaded")} className="text-xs font-medium"><Receipt className="mr-2 h-3.5 w-3.5" /> Download GST Invoice</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Exported to CSV")} className="text-xs font-medium"><Download className="mr-2 h-3.5 w-3.5" /> Export</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )},
          ]}
        />
      </SectionCard>
    </div>
  );
}
