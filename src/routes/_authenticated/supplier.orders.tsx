import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Package, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useSupplierOrders, type SupplierOrder } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/orders")({
  head: () => ({ meta: [{ title: "Orders — Supplier" }] }),
  component: SupplierOrdersPage,
});

const STATUS_TONE: Record<SupplierOrder["status"], "warning" | "info" | "success" | "danger" | "muted"> = {
  pending: "warning",
  accepted: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

function SupplierOrdersPage() {
  const { orders, updateStatus } = useSupplierOrders();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const filtered = orders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (q && !`${o.orderNumber} ${o.customer} ${o.product}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const pending = orders.filter((o) => o.status === "pending").length;
  const inTransit = orders.filter((o) => o.status === "shipped" || o.status === "packed").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.amount, 0);

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Orders" description="Accept, pack and ship customer orders from a single command centre." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending" value={String(pending)} icon={Package} tone="warning" hint="Action required" />
          <StatCard label="In transit" value={String(inTransit)} icon={Truck} tone="info" hint="Shipping" delay={0.05} />
          <StatCard label="Delivered" value={String(delivered)} icon={PackageCheck} tone="success" hint="Completed" delay={0.1} />
          <StatCard label="Revenue" value={inr(revenue)} icon={FileText} tone="brand" hint="From orders" delay={0.15} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="packed">Packed</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input className="sm:w-72" placeholder="Search order number, customer, product" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <DataTable<SupplierOrder>
          rows={filtered}
          columns={[
            { key: "num", header: "Order", cell: (o) => <span className="font-semibold">{o.orderNumber}</span> },
            { key: "cust", header: "Customer", cell: (o) => <div><div className="font-medium">{o.customer}</div><div className="text-xs text-muted-foreground">{o.destination}</div></div> },
            { key: "prod", header: "Product", cell: (o) => <span>{o.product} <span className="text-muted-foreground">× {o.qty}</span></span> },
            { key: "amt", header: "Amount", cell: (o) => <span className="font-semibold">{inr(o.amount)}</span> },
            { key: "pay", header: "Payment", cell: (o) => <Pill tone={o.paymentStatus === "paid" ? "success" : "warning"}>{o.paymentStatus}</Pill> },
            { key: "status", header: "Status", cell: (o) => <Pill tone={STATUS_TONE[o.status]}>{o.status}</Pill> },
            {
              key: "date",
              header: "Placed",
              cell: (o) => <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</span>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (o) => (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">Manage</Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Order {o.orderNumber}</SheetTitle>
                      <SheetDescription>{o.customer} • {o.destination}</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 text-sm">
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="font-semibold">{o.product}</div>
                        <div className="text-xs text-muted-foreground">Qty {o.qty} • {inr(o.amount)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <ActionButton label="Accept" onClick={() => { updateStatus(o.id, "accepted"); toast.success("Order accepted"); }} />
                        <ActionButton label="Reject" tone="danger" onClick={() => { updateStatus(o.id, "cancelled"); toast.success("Order rejected"); }} />
                        <ActionButton label="Mark packed" onClick={() => { updateStatus(o.id, "packed"); toast.success("Marked packed"); }} />
                        <ActionButton label="Mark shipped" onClick={() => { updateStatus(o.id, "shipped"); toast.success("Marked shipped"); }} />
                        <ActionButton label="Mark delivered" onClick={() => { updateStatus(o.id, "delivered"); toast.success("Marked delivered"); }} />
                        <ActionButton label="Cancel" tone="danger" onClick={() => { updateStatus(o.id, "cancelled"); toast.success("Order cancelled"); }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => toast.info("Invoice PDF coming soon")}><FileText className="mr-1.5 h-4 w-4" />Invoice</Button>
                        <Button variant="outline" onClick={() => toast.info("Packing slip coming soon")}><Package className="mr-1.5 h-4 w-4" />Packing slip</Button>
                        <Button variant="outline" onClick={() => toast.info("Delivery partner coming soon")}><Truck className="mr-1.5 h-4 w-4" />Assign delivery</Button>
                        <Button variant="outline" onClick={() => toast.info("Refund flow coming soon")}>Refund</Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ),
            },
          ]}
        />
      </div>
    
  );
}

function ActionButton({ label, onClick, tone }: { label: string; onClick: () => void; tone?: "danger" }) {
  return (
    <Button
      variant={tone === "danger" ? "outline" : "default"}
      className={tone === "danger" ? "text-destructive" : ""}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
