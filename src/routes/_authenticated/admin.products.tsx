import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, CheckCircle2, Copy, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminProducts, type AdminProduct } from "@/data/admin";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const [status, setStatus] = useState("all");
  const [products, setProducts] = useState(adminProducts);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = products.filter((p) => status === "all" || p.status === status);
  const setStatusOn = (ids: string[], s: AdminProduct["status"]) =>
    setProducts((all) => all.map((p) => (ids.includes(p.id) ? { ...p, status: s } : p)));

  const bulk = (label: string, fn: () => void) => {
    if (selected.length === 0) return toast.error("Select products first");
    fn();
    toast.success(`${label} — ${selected.length} products`);
    setSelected([]);
  };

  const columns: AdminColumn<AdminProduct>[] = [
    { key: "id", header: "SKU", render: (p) => <span className="font-mono text-xs">{p.id}</span> },
    { key: "name", header: "Product", render: (p) => <span className="font-semibold">{p.name}</span> },
    { key: "category", header: "Category", render: (p) => <span className="text-sm text-muted-foreground">{p.category}</span> },
    { key: "supplier", header: "Supplier", render: (p) => <span className="text-sm">{p.supplier}</span> },
    { key: "price", header: "Price", render: (p) => <span className="text-sm font-medium">{inr(p.price)}</span> },
    { key: "moq", header: "MOQ", render: (p) => <span className="text-sm">{p.moq}</span> },
    { key: "stock", header: "Stock", render: (p) => <span className={p.stock === 0 ? "text-destructive text-sm font-semibold" : "text-sm"}>{p.stock}</span> },
    { key: "reports", header: "Reports", render: (p) => p.reports > 0 ? <Pill tone="danger">{p.reports}</Pill> : <span className="text-xs text-muted-foreground">—</span> },
    {
      key: "status", header: "Status", render: (p) => (
        <Pill tone={p.status === "live" ? "success" : p.status === "pending" ? "warning" : p.status === "rejected" ? "danger" : "muted"}>
          {p.status}
        </Pill>
      ),
    },
    {
      key: "actions", header: "", className: "text-right", render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setStatusOn([p.id], "live"); toast.success("Approved"); }}>Approve</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setStatusOn([p.id], "rejected"); toast.error("Rejected"); }}>Reject</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setStatusOn([p.id], "archived"); toast("Archived"); }}>Archive</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Edit coming soon")}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Duplicate check queued")}>Check duplicates</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Product management"
        description="Approve, reject, archive and manage every product across the marketplace."
      />

      <AdminTable
        rows={filtered}
        columns={columns}
        getRowId={(p) => p.id}
        selectable
        onSelectionChange={setSelected}
        searchable={(p) => `${p.name} ${p.supplier} ${p.category} ${p.id}`}
        searchPlaceholder="Search products, suppliers, SKUs…"
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => bulk("Approved", () => setStatusOn(selected, "live"))}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("Rejected", () => setStatusOn(selected, "rejected"))}>
                <XCircle className="mr-1.5 h-4 w-4" /> Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("Archived", () => setStatusOn(selected, "archived"))}>
                <Archive className="mr-1.5 h-4 w-4" /> Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulk("Exported", () => {})}>
                <Copy className="mr-1.5 h-4 w-4" /> Export
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulk("Deleted", () => setProducts((all) => all.filter((p) => !selected.includes(p.id))))}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          </>
        }
      />
    </AdminLayout>
  );
}
