import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy, Download, Edit3, Filter, MoreVertical, Package, Plus, Search,
  Tag, Trash2, Upload, Boxes, FileText, CheckCircle2, AlertCircle, ArrowUpDown, RefreshCcw, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";
import type { SupplierProduct } from "@/types/supplier";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/products/")({
  head: () => ({ meta: [{ title: "Product Management — Seller" }] }),
  component: SupplierProductsPage,
});

type StockBand = "healthy" | "medium" | "low" | "out";
const stockBand = (p: SupplierProduct): StockBand =>
  p.stock === 0 ? "out" : p.stock < 25 ? "low" : p.stock < 100 ? "medium" : "healthy";

const bandStyles: Record<StockBand, { bar: string; text: string; label: string }> = {
  healthy: { bar: "bg-success", text: "text-success", label: "Healthy" },
  medium:  { bar: "bg-warning", text: "text-warning", label: "Medium" },
  low:     { bar: "bg-[color:hsl(25_95%_53%)]", text: "text-[color:hsl(25_95%_45%)]", label: "Low" },
  out:     { bar: "bg-destructive", text: "text-destructive", label: "Out" },
};

function SupplierProductsPage() {
  const { products, remove, duplicate, updateProduct } = useSupplierProducts();
  const navigate = useNavigate();
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [stock, setStock] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))), [products]);

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === "published").length,
    drafts: products.filter((p) => p.status === "draft").length,
    out: products.filter((p) => p.stock === 0).length,
    low: products.filter((p) => p.stock > 0 && p.stock < 25).length,
  };

  const filtered = products
    .filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (status !== "all" && p.status !== status) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (stock === "instock" && p.stock === 0) return false;
      if (stock === "out" && p.stock !== 0) return false;
      if (stock === "low" && !(p.stock > 0 && p.stock < 25)) return false;
      if (q && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "highest") return b.wholesalePrice - a.wholesalePrice;
      if (sortBy === "lowest") return a.wholesalePrice - b.wholesalePrice;
      if (sortBy === "bestselling") return b.stock - a.stock; // Mocking best selling
      return 0;
    });

  const handleBulkDelete = () => {
    selectedIds.forEach(id => remove(id));
    setSelectedIds([]);
    toast.success(`Deleted ${selectedIds.length} products`);
  };

  const handleBulkStatus = (newStatus: "published" | "draft" | "archived") => {
    selectedIds.forEach(id => updateProduct(id, { status: newStatus }));
    setSelectedIds([]);
    toast.success(`Updated status for ${selectedIds.length} products`);
  };

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Product Management"
        description="Manage your wholesale products, pricing, stock and visibility."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info("Bulk upload — coming soon")}><Upload className="mr-1.5 h-4 w-4" /> Bulk Upload</Button>
            <Button variant="outline" onClick={() => toast.info("Export queued")}><Download className="mr-1.5 h-4 w-4" /> Export Products</Button>
            <Button asChild className="shadow-brand"><Link to="/supplier/products/new"><Plus className="mr-1.5 h-4 w-4" /> Add Product</Link></Button>
          </div>
        }
      />

      {/* Product Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title="Total Products" value={counts.all} icon={Package} tint="bg-brand/10 text-brand" />
        <SummaryCard title="Active Products" value={counts.active} icon={CheckCircle2} tint="bg-success/10 text-success" />
        <SummaryCard title="Draft Products" value={counts.drafts} icon={FileText} tint="bg-muted text-muted-foreground" />
        <SummaryCard title="Out of Stock" value={counts.out} icon={AlertCircle} tint="bg-destructive/10 text-destructive" />
        <SummaryCard title="Low Stock" value={counts.low} icon={TrendingUp} tint="bg-[color:hsl(25_95%_53%)]/10 text-[color:hsl(25_95%_53%)]" />
      </div>

      <SectionCard className="p-0 overflow-visible">
        {/* Search & Filters */}
        <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center bg-muted/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-background" placeholder="Search products, SKUs..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-32 bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("-", " ")}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-32 bg-background"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={stock} onValueChange={setStock}>
              <SelectTrigger className="w-32 bg-background"><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 bg-background">
                <div className="flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground"/> <SelectValue placeholder="Sort By" /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Price</SelectItem>
                <SelectItem value="lowest">Lowest Price</SelectItem>
                <SelectItem value="bestselling">Best Selling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <DataTable<SupplierProduct>
          rows={filtered}
          selectable={true}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          pageSize={10}
          bulkActions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("published")}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Publish</Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("draft")}><FileText className="mr-1.5 h-3.5 w-3.5" /> Draft</Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatus("archived")}><ArchiveIcon className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
            </div>
          }
          columns={[
            {
              key: "product",
              header: "Product & SKU",
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-10 w-10 rounded-md border border-border object-cover" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{p.sku}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "category_brand",
              header: "Category & Brand",
              cell: (p) => (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{p.brand || "—"}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-semibold capitalize text-info">
                    {p.category.replace("-", " ")}
                  </span>
                </div>
              ),
            },
            { key: "moq", header: "MOQ", cell: (p) => <span className="text-sm font-medium">{p.moq} {p.unit}</span> },
            {
              key: "price_gst",
              header: "Price & GST",
              cell: (p) => (
                <div className="flex flex-col">
                  <span className="font-semibold">{inr(p.wholesalePrice)}</span>
                  <span className="text-[11px] text-muted-foreground">GST: {p.gstRate}%</span>
                </div>
              ),
            },
            {
              key: "stock",
              header: "Available Stock",
              cell: (p) => {
                const band = stockBand(p);
                const s = bandStyles[band];
                // Full bar when any stock is available; empty only when out of stock
                const pct = p.stock <= 0 ? 0 : 100;
                return (
                  <div className="min-w-[120px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-semibold", s.text)}>{p.stock === 0 ? "Out of Stock" : `${p.stock} ${p.unit}`}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              cell: (p) => (
                <Pill tone={p.status === "published" ? "success" : p.status === "draft" ? "muted" : "warning"}>
                  {p.status === "published" ? "Active" : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </Pill>
              ),
            },
            {
              key: "updatedAt",
              header: "Last Updated",
              cell: (p) => <span className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</span>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (p) => (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/products/$id", params: { id: p.id } }); }}><Edit3 className="h-4 w-4" /></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { navigate({ to: "/supplier/products/$id", params: { id: p.id } }); }}>
                        <Search className="mr-2 h-3.5 w-3.5" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { void duplicate(p.id).then(() => toast.success("Duplicated")).catch((e: Error) => toast.error(e.message)); }}>
                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { void updateProduct(p.id, { status: p.status === "archived" ? "draft" : "archived" }).then(() => toast.success("Updated")).catch((e: Error) => toast.error(e.message)); }}>
                        <RefreshCcw className="mr-2 h-3.5 w-3.5" /> {p.status === "archived" ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => { void remove(p.id).then(() => toast.success("Deleted")).catch((e: Error) => toast.error(e.message)); }}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
          onRowClick={(p) => navigate({ to: "/supplier/products/$id", params: { id: p.id } })}
          empty={<div className="space-y-4 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Boxes className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">No products added yet.</div>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Get started by creating your first product or bulk uploading your catalog.</p>
            </div>
            <Button asChild className="mt-4 shadow-brand"><Link to="/supplier/products/new"><Plus className="mr-1.5 h-4 w-4" /> Add Your First Product</Link></Button>
          </div>}
        />
      </SectionCard>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, tint }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", tint)}><Icon className="h-4 w-4" /></span>
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
    </div>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="5" x="2" y="4" rx="2" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}
