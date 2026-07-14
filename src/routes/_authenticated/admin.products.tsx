import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import type { AdminProduct } from "@/data/admin";
import { useProducts } from "@/hooks/useCatalog";
import { supabase } from "@/integrations/supabase/client";
import { mapProductToAdmin } from "@/lib/catalogAdminMap";
import { inr } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: catalog = [], isLoading } = useProducts();
  const products = useMemo(() => catalog.map(mapProductToAdmin), [catalog]);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const idBySku = useMemo(() => {
    const map = new Map<string, string>();
    catalog.forEach((p) => map.set(p.sku || p.id, p.id));
    return map;
  }, [catalog]);

  const filtered = products.filter((p) => status === "all" || p.status === status);

  const setStockStatus = async (adminIds: string[], live: boolean) => {
    const ids = adminIds.map((a) => idBySku.get(a) ?? a);
    const { error } = await supabase
      .from("products")
      .update({ in_stock: live, ...(live ? {} : { stock_count: 0 }) })
      .in("id", ids);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
  };

  const deleteProducts = async (adminIds: string[]) => {
    const ids = adminIds.map((a) => idBySku.get(a) ?? a);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
  };

  const bulk = async (label: string, fn: () => Promise<void>) => {
    if (selected.length === 0) return toast.error("Select products first");
    await fn();
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
            <DropdownMenuItem onClick={() => { void setStockStatus([p.id], true).then(() => toast.success("Marked in stock")); }}>Approve / Restock</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { void setStockStatus([p.id], false).then(() => toast.error("Marked out of stock")); }}>Mark out of stock</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { void setStockStatus([p.id], false).then(() => toast("Archived")); }}>Archive</DropdownMenuItem>
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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
        </div>
      ) : (
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
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => void bulk("Approved", () => setStockStatus(selected, true))}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => void bulk("Out of stock", () => setStockStatus(selected, false))}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Out of stock
                </Button>
                <Button size="sm" variant="outline" onClick={() => void bulk("Archived", () => setStockStatus(selected, false))}>
                  <Archive className="mr-1.5 h-4 w-4" /> Archive
                </Button>
                <Button size="sm" variant="outline" onClick={() => void bulk("Exported", async () => {})}>
                  <Copy className="mr-1.5 h-4 w-4" /> Export
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => void bulk("Deleted", () => deleteProducts(selected))}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            </>
          }
        />
      )}
    </AdminLayout>
  );
}
