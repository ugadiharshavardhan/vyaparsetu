import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Copy, Download, Edit3, MoreVertical, Package, Plus, Search, Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";
import type { SupplierProduct } from "@/types/supplier";

export const Route = createFileRoute("/_authenticated/supplier/products/")({
  head: () => ({ meta: [{ title: "Products — Supplier" }] }),
  component: SupplierProductsPage,
});

function SupplierProductsPage() {
  const { products, remove, duplicate, updateProduct } = useSupplierProducts();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const filtered = products.filter((p) => {
    if (tab === "published" && p.status !== "published") return false;
    if (tab === "draft" && p.status !== "draft") return false;
    if (tab === "archived" && p.status !== "archived") return false;
    if (q && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Products"
          description="Manage your entire catalog with bulk actions and clean status tracking."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.info("Bulk upload coming soon")}> <Upload className="mr-1.5 h-4 w-4" /> Bulk upload</Button>
              <Button variant="outline" onClick={() => toast.info("Export coming soon")}> <Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
              <Button asChild><Link to="/supplier/products/new"><Plus className="mr-1.5 h-4 w-4" /> New product</Link></Button>
            </div>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All ({products.length})</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search products, SKUs, brands" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <DataTable<SupplierProduct>
          rows={filtered}
          columns={[
            {
              key: "product",
              header: "Product",
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} • SKU {p.sku}</div>
                  </div>
                </div>
              ),
            },
            { key: "cat", header: "Category", cell: (p) => <span className="capitalize">{p.category.replace("-", " ")}</span> },
            { key: "price", header: "Price", cell: (p) => <span className="font-semibold">{inr(p.wholesalePrice)}</span> },
            {
              key: "stock",
              header: "Stock",
              cell: (p) => (
                <Pill tone={p.stock === 0 ? "danger" : p.stock < 25 ? "warning" : "success"}>
                  {p.stock === 0 ? "Out" : `${p.stock} ${p.unit}`}
                </Pill>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (p) => (
                <Pill tone={p.status === "published" ? "success" : p.status === "draft" ? "muted" : "warning"}>
                  {p.status}
                </Pill>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (p) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate({ to: "/supplier/products/$id", params: { id: p.id } })}>
                      <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { duplicate(p.id); toast.success("Duplicated"); }}>
                      <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { updateProduct(p.id, { status: p.status === "archived" ? "draft" : "archived" }); toast.success("Updated"); }}>
                      <Package className="mr-2 h-3.5 w-3.5" /> {p.status === "archived" ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { remove(p.id); toast.success("Deleted"); }}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          onRowClick={(p) => navigate({ to: "/supplier/products/$id", params: { id: p.id } })}
          empty={<div className="space-y-3 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="font-semibold">No products yet</div>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">Add your first product to start receiving wholesale orders.</p>
            <Button asChild><Link to="/supplier/products/new">Add product</Link></Button>
          </div>}
        />
      </div>
    </DashboardLayout>
  );
}
