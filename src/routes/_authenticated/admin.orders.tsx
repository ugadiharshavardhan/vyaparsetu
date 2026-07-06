import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, MoreHorizontal, Truck } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminOrders, type AdminOrder } from "@/data/admin";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const filtered = adminOrders.filter((o) =>
    (status === "all" || o.status === status) &&
    (payment === "all" || o.payment === payment)
  );

  const columns: AdminColumn<AdminOrder>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-mono text-xs">{o.id}</span> },
    { key: "buyer", header: "Buyer", render: (o) => <span className="text-sm font-medium">{o.buyer}</span> },
    { key: "supplier", header: "Supplier", render: (o) => <span className="text-sm text-muted-foreground">{o.supplier}</span> },
    { key: "amount", header: "Amount", render: (o) => <span className="text-sm font-semibold">{inr(o.amount)}</span> },
    { key: "items", header: "Items", render: (o) => <span className="text-sm">{o.items}</span> },
    { key: "method", header: "Payment", render: (o) => <Pill tone="info">{o.method.toUpperCase()}</Pill> },
    { key: "payStatus", header: "Pay status", render: (o) => (
      <Pill tone={o.payment === "paid" ? "success" : o.payment === "failed" ? "danger" : o.payment === "refunded" ? "warning" : "muted"}>{o.payment}</Pill>
    ) },
    { key: "status", header: "Status", render: (o) => <Pill tone={
      o.status === "delivered" ? "success" :
      o.status === "cancelled" || o.status === "disputed" ? "danger" :
      o.status === "refunded" ? "warning" : "info"
    }>{o.status}</Pill> },
    { key: "state", header: "State", render: (o) => <span className="text-xs text-muted-foreground">{o.state}</span> },
    {
      key: "actions", header: "", className: "text-right", render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Order details")}>View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Edit order")}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Delivery partner assigned")}><Truck className="mr-2 h-4 w-4" /> Assign delivery</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Invoice generated")}><FileText className="mr-2 h-4 w-4" /> Generate invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Invoice email sent")}>Resend invoice</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => toast.error("Order cancelled")}>Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Order management"
        description="View and manage every order across the platform."
        action={<Button variant="outline" onClick={() => toast.success("Export queued")}><Download className="mr-2 h-4 w-4" /> Export</Button>}
      />
      <AdminTable
        rows={filtered}
        columns={columns}
        getRowId={(o) => o.id}
        searchable={(o) => `${o.id} ${o.buyer} ${o.supplier}`}
        searchPlaceholder="Search order ID, buyer or supplier…"
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
    </AdminLayout>
  );
}
