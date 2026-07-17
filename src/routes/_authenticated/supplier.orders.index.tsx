import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FileText, Package, PackageCheck, Truck, Clock, CheckCircle2, Search, MoreVertical, XCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { useProfile } from "@/hooks/useProfile";
import { useSellerSampleRequests } from "@/hooks/useSampleRequests";
import { downloadSellerInvoice } from "@/lib/invoice/downloadSellerInvoice";
import type { SupplierOrder } from "@/types/supplier";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/orders/")({
  head: () => ({ meta: [{ title: "Orders — Seller" }] }),
  component: SupplierOrdersPage,
});

const STATUS_TONE: Record<SupplierOrder["status"], "warning" | "info" | "success" | "danger" | "muted"> = {
  pending: "warning",
  accepted: "info",
  packing: "info",
  ready: "success",
  picked_up: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

const STATUS_LABEL: Record<SupplierOrder["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  packing: "Packing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  shipped: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/**
 * One table row per ORDER (not per order_item line). Base fields come from the
 * first line; qty/amount are summed across all lines of the same parent order.
 */
type SellerOrderGroup = SupplierOrder & { lines: SupplierOrder[] };

function groupByOrder(lines: SupplierOrder[]): SellerOrderGroup[] {
  const map = new Map<string, SupplierOrder[]>();
  for (const line of lines) {
    const key = line.orderId ?? line.id;
    const bucket = map.get(key);
    if (bucket) bucket.push(line);
    else map.set(key, [line]);
  }
  return [...map.values()].map((group) => ({
    ...group[0],
    lines: group,
    qty: group.reduce((sum, l) => sum + l.qty, 0),
    amount: group.reduce((sum, l) => sum + l.amount, 0),
  }));
}

function SupplierOrdersPage() {
  const { orders, updateStatus, updatePaymentStatus } = useSupplierOrders();
  const { byOrderItem: sampleRequestByItem } = useSellerSampleRequests();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Order-wise view: one row per parent order, with all of its item lines.
  const groupedOrders = useMemo(() => groupByOrder(orders), [orders]);

  const counts = {
    today: groupedOrders.filter((o) => new Date(o.createdAt) >= today).length,
    pending: groupedOrders.filter((o) => o.status === "pending").length,
    accepted: groupedOrders.filter((o) => o.status === "accepted").length,
    packing: groupedOrders.filter((o) => o.status === "packing").length,
    ready: groupedOrders.filter((o) => o.status === "ready").length,
    completed: groupedOrders.filter((o) => o.status === "delivered").length,
  };

  const filtered = groupedOrders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
    const haystack = `${o.orderNumber} ${o.customer} ${o.buyerBusiness ?? ""} ${o.lines
      .map((l) => l.product)
      .join(" ")}`.toLowerCase();
    if (q && !haystack.includes(q.toLowerCase())) return false;
    return true;
  });

  const changeStatus = async (id: string, newStatus: SupplierOrder["status"], message: string) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update order");
    }
  };

  const handleBulkStatus = async (newStatus: SupplierOrder["status"]) => {
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => updateStatus(id, newStatus)));
      setSelectedIds([]);
      toast.success(`Updated ${ids.length} order${ids.length > 1 ? "s" : ""} to ${STATUS_LABEL[newStatus]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update some orders");
    }
  };

  const togglePayment = async (o: SellerOrderGroup) => {
    const next = o.paymentStatus === "paid" ? "pending" : "paid";
    try {
      await updatePaymentStatus(o.id, next);
      toast.success(next === "paid" ? "Payment marked as completed" : "Payment marked as pending");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update payment status");
    }
  };

  const handleInvoice = (o: SellerOrderGroup) => {
    try {
      downloadSellerInvoice(o.lines[0], { sellerName: profile?.business_name, items: o.lines });
      toast.success("GST invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate invoice");
    }
  };

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Orders"
        description="Accept, pack, and manage customer orders from a single command centre."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info("Exporting orders")}><FileText className="mr-1.5 h-4 w-4" /> Export</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard title="Orders Today" value={counts.today} icon={Clock} tint="bg-brand/10 text-brand" />
        <SummaryCard title="Pending" value={counts.pending} icon={AlertCircle} tint="bg-warning/20 text-warning" />
        <SummaryCard title="Accepted" value={counts.accepted} icon={CheckCircle2} tint="bg-info/20 text-info" />
        <SummaryCard title="Packing" value={counts.packing} icon={Package} tint="bg-brand/10 text-brand" />
        <SummaryCard title="Ready for Pickup" value={counts.ready} icon={Truck} tint="bg-[color:hsl(25_95%_53%)]/20 text-[color:hsl(25_95%_53%)]" />
        <SummaryCard title="Completed" value={counts.completed} icon={PackageCheck} tint="bg-success/20 text-success" />
      </div>

      <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
        <div className="px-6 py-5 border-b border-border flex flex-col gap-4 lg:flex-row lg:items-center bg-muted/5 rounded-t-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
            <Input className="pl-9.5 bg-background rounded-full border-border/70 h-10 shadow-sm" placeholder="Search Order ID, Retailer, Product..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background rounded-full border-border/70 h-10 shadow-sm"><SelectValue placeholder="Order Status" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="packing">Packing</SelectItem>
                <SelectItem value="ready">Ready for Pickup</SelectItem>
                <SelectItem value="shipped">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40 bg-background rounded-full border-border/70 h-10 shadow-sm"><SelectValue placeholder="Payment Status" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable<SellerOrderGroup>
          rows={filtered}
          selectable={true}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          pageSize={10}
          embedded={true}
          bulkActions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("accepted")}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept</Button>
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("packing")}><Package className="mr-1.5 h-3.5 w-3.5" /> Start Packing</Button>
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("ready")}><Truck className="mr-1.5 h-3.5 w-3.5" /> Ready for Pickup</Button>
              <Button size="sm" variant="destructive" className="h-8 px-3 rounded-full text-xs font-semibold" onClick={() => handleBulkStatus("cancelled")}><XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject</Button>
            </div>
          }
          columns={[
            {
              key: "id",
              header: "Order ID & Date",
              cell: (o) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{o.orderNumber}</span>
                  <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              )
            },
            {
              key: "retailer",
              header: "Retailer",
              cell: (o) => (
                <div className="flex flex-col">
                  <span className="font-medium">{o.buyerBusiness || o.customer}</span>
                  <span className="text-xs text-muted-foreground">{o.destination}</span>
                </div>
              )
            },
            {
              key: "product",
              header: "Items",
              cell: (o) => {
                const shown = o.lines.slice(0, 2);
                const extra = o.lines.length - shown.length;
                // Aggregate sample state across every line of this order.
                const sampleLines = o.lines.filter((l) => l.sampleRequested);
                const requestStates = sampleLines.map(
                  (l) => sampleRequestByItem.get(l.id)?.status ?? "requested",
                );
                const pendingSamples = requestStates.filter((s) => s === "requested").length;
                const awaiting = requestStates.filter((s) => s === "sent").length;
                const approved = requestStates.filter((s) => s === "approved").length;
                const rejected = requestStates.filter((s) => s === "rejected").length;
                return (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {o.lines.length} item{o.lines.length > 1 ? "s" : ""} · Qty {o.qty}
                    </span>
                    {shown.map((l) => (
                      <span key={l.id} className="truncate text-sm font-medium">
                        {l.product} <span className="text-xs font-normal text-muted-foreground">× {l.qty}</span>
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="text-xs text-muted-foreground">+ {extra} more item{extra > 1 ? "s" : ""}</span>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {pendingSamples > 0 && (
                        <span className="mt-0.5 w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {pendingSamples} sample{pendingSamples > 1 ? "s" : ""} requested
                        </span>
                      )}
                      {awaiting > 0 && (
                        <span className="mt-0.5 w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                          Sample: awaiting buyer approval
                        </span>
                      )}
                      {approved > 0 && (
                        <span className="mt-0.5 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Sample approved
                        </span>
                      )}
                      {rejected > 0 && (
                        <span className="mt-0.5 w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                          Sample declined
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            },
            {
              key: "value",
              header: "Order Value",
              cell: (o) => <span className="font-semibold">{inr(o.amount)}</span>
            },
            {
              key: "payment",
              header: "Payment",
              cell: (o) => (
                <button
                  type="button"
                  className="cursor-pointer rounded-full transition-transform hover:scale-105"
                  title={o.paymentStatus === "paid" ? "Click to mark payment as pending" : "Click to mark payment as completed"}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePayment(o);
                  }}
                >
                  <Pill tone={o.paymentStatus === "paid" ? "success" : "warning"}>
                    {o.paymentStatus === "paid" ? "completed" : "pending"}
                  </Pill>
                </button>
              )
            },
            {
              key: "status",
              header: "Status",
              cell: (o) => <Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill>
            },
            {
              key: "delivery",
              header: "Expected Delivery",
              cell: (o) => <span className="text-sm font-medium">{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : "TBD"}</span>
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (o) => (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/orders/$id", params: { id: o.id } }); }}>View</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {o.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => changeStatus(o.id, "accepted", "Order accepted")}><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Accept Order</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => changeStatus(o.id, "cancelled", "Order rejected")}><XCircle className="mr-2 h-3.5 w-3.5" /> Reject Order</DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {o.status === "accepted" && (
                        <DropdownMenuItem onClick={() => changeStatus(o.id, "packing", "Packing started")}><Package className="mr-2 h-3.5 w-3.5" /> Start Packing</DropdownMenuItem>
                      )}
                      {o.status === "packing" && (
                        <DropdownMenuItem onClick={() => changeStatus(o.id, "ready", "Ready for pickup")}><Truck className="mr-2 h-3.5 w-3.5" /> Mark Ready for Pickup</DropdownMenuItem>
                      )}
                      {!["delivered", "cancelled", "returned"].includes(o.status) && (
                        <DropdownMenuItem onClick={() => changeStatus(o.id, "delivered", "Order marked as delivered")}><PackageCheck className="mr-2 h-3.5 w-3.5" /> Mark as Delivered</DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleInvoice(o)}><FileText className="mr-2 h-3.5 w-3.5" /> Download Invoice</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
          onRowClick={(o) => navigate({ to: "/supplier/orders/$id", params: { id: o.id } })}
          empty={
            <div className="space-y-4 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">No orders found</div>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">You don't have any orders matching your criteria.</p>
              </div>
            </div>
          }
        />
      </SectionCard>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, tint }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tint: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:border-border/80 hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-2.5">
        <span className={cn("grid h-8.5 w-8.5 place-items-center rounded-xl transition-colors", tint)}><Icon className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 line-clamp-1">{title}</span>
      </div>
      <div className="text-2xl font-display font-bold tracking-tight text-foreground">{value}</div>
    </div>
  );
}
