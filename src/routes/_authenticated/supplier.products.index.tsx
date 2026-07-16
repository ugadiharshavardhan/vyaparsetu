import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { z } from "zod";
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

const productSearchSchema = z.object({
  q: z.string().optional().catch(""),
  cat: z.string().optional().catch("all"),
  status: z.string().optional().catch("all"),
  stock: z.string().optional().catch("all"),
  brand: z.string().optional().catch("all"),
  sortBy: z.string().optional().catch("newest"),
  page: z.number().int().positive().optional().catch(1),
});

export const Route = createFileRoute("/_authenticated/supplier/products/")({
  head: () => ({ meta: [{ title: "Product Management — Seller" }] }),
  validateSearch: (search) => productSearchSchema.parse(search),
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

  const search = Route.useSearch();

  const q = search.q ?? "";
  const cat = search.cat ?? "all";
  const status = search.status ?? "all";
  const stock = search.stock ?? "all";
  const brand = search.brand ?? "all";
  const sortBy = search.sortBy ?? "newest";
  const page = search.page ?? 1;

  const setQ = (val: string) => navigate({ search: (prev) => ({ ...prev, q: val || undefined, page: 1 }), replace: true });
  const setCat = (val: string) => navigate({ search: (prev) => ({ ...prev, cat: val !== "all" ? val : undefined, page: 1 }) });
  const setStatus = (val: string) => navigate({ search: (prev) => ({ ...prev, status: val !== "all" ? val : undefined, page: 1 }) });
  const setStock = (val: string) => navigate({ search: (prev) => ({ ...prev, stock: val !== "all" ? val : undefined, page: 1 }) });
  const setBrand = (val: string) => navigate({ search: (prev) => ({ ...prev, brand: val !== "all" ? val : undefined, page: 1 }) });
  const setSortBy = (val: string) => navigate({ search: (prev) => ({ ...prev, sortBy: val !== "newest" ? val : undefined }) });
  const setPage = (p: number) => navigate({ search: (prev) => ({ ...prev, page: p }) });

  // Restore query parameters from sessionStorage on mount if URL has no active params
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const savedSearch = sessionStorage.getItem("vs:supplier:products:search");
    if (savedSearch) {
      try {
        const parsed = JSON.parse(savedSearch);
        const hasParamsInUrl = Boolean(search.q || (search.cat && search.cat !== "all") || (search.status && search.status !== "all") || (search.stock && search.stock !== "all") || (search.brand && search.brand !== "all") || (search.sortBy && search.sortBy !== "newest") || (search.page && search.page > 1));

        if (!hasParamsInUrl) {
          // Check if the saved search has any meaningful state worth restoring
          const hasSavedState = Boolean(parsed.q || parsed.cat || parsed.status || parsed.stock || parsed.brand || parsed.sortBy || (parsed.page && parsed.page > 1));
          if (hasSavedState) {
            navigate({ search: parsed, replace: true });
          }
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  // Save query parameters to sessionStorage when they change
  useEffect(() => {
    sessionStorage.setItem("vs:supplier:products:search", JSON.stringify(search));
  }, [search]);

  // Track and save scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem("vs:supplier:products:scroll", String(window.scrollY));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore scroll position once after products load
  const scrollRestoredRef = useRef(false);
  useEffect(() => {
    if (scrollRestoredRef.current) return;
    const savedScroll = sessionStorage.getItem("vs:supplier:products:scroll");
    if (savedScroll && products.length > 0) {
      scrollRestoredRef.current = true;
      const timer = setTimeout(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: "instant" as ScrollBehavior });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [products]);

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
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" className="h-10 px-5 rounded-full border-border/60 text-muted-foreground bg-transparent hover:bg-muted/30 hover:text-foreground hover:border-border transition-all duration-200 text-xs font-medium" onClick={() => toast.info("Bulk upload — coming soon")}><Upload className="mr-2 h-4 w-4 shrink-0" /> Bulk Upload</Button>
            <Button variant="outline" className="h-10 px-5 rounded-full border-border/60 text-muted-foreground bg-transparent hover:bg-muted/30 hover:text-foreground hover:border-border transition-all duration-200 text-xs font-medium" onClick={() => toast.info("Export queued")}><Download className="mr-2 h-4 w-4 shrink-0" /> Export Products</Button>
            <Button asChild className="h-10 px-5 rounded-full bg-brand text-white hover:bg-brand/90 hover:shadow-brand transition-all duration-200 text-xs font-semibold shadow-soft"><Link to="/supplier/products/new"><Plus className="mr-2 h-4 w-4 shrink-0" /> Add Product</Link></Button>
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

      <SectionCard className="p-0 overflow-visible border-border/50 shadow-soft">
        {/* Search & Filters */}
        <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center bg-muted/5 rounded-t-2xl">
          <div className="relative flex-1 min-w-[240px] group">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-brand" />
            <Input
              className="pl-10 h-10 rounded-full border-border/60 bg-background placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-brand/10 focus-visible:border-brand transition-all duration-200"
              placeholder="Search products, SKUs..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-40 h-10 rounded-full border-border/60 bg-background text-xs font-medium hover:bg-muted/30 focus:ring-brand/10 transition-all duration-200"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("-", " ")}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-36 h-10 rounded-full border-border/60 bg-background text-xs font-medium hover:bg-muted/30 focus:ring-brand/10 transition-all duration-200"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={stock} onValueChange={setStock}>
              <SelectTrigger className="w-36 h-10 rounded-full border-border/60 bg-background text-xs font-medium hover:bg-muted/30 focus:ring-brand/10 transition-all duration-200"><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 h-10 rounded-full border-border/60 bg-background text-xs font-medium hover:bg-muted/30 focus:ring-brand/10 transition-all duration-200"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-10 rounded-full border-border/60 bg-background text-xs font-medium hover:bg-muted/30 focus:ring-brand/10 transition-all duration-200">
                <div className="flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60"/> <SelectValue placeholder="Sort By" /></div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-elevated">
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
          page={page}
          onPageChange={setPage}
          embedded={true}
          bulkActions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("published")}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Publish</Button>
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("draft")}><FileText className="mr-1.5 h-3.5 w-3.5" /> Draft</Button>
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-medium border-border/60 hover:bg-muted/40" onClick={() => handleBulkStatus("archived")}><ArchiveIcon className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
              <Button size="sm" variant="destructive" className="h-8 px-3 rounded-full text-xs font-semibold" onClick={handleBulkDelete}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
            </div>
          }
          columns={[
            {
              key: "product",
              header: "Product & SKU",
              className: "max-w-[280px] lg:max-w-[360px] xl:max-w-[440px]",
              cell: (p) => (
                <div className="flex items-center gap-3.5 group">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                    <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground/90 break-words leading-tight">{p.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono mt-1">{p.sku}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "category_brand",
              header: "Category & Brand",
              cell: (p) => (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground/90">{p.brand || "—"}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-info-soft/40 border border-info-soft/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-info">
                    {p.category.replace("-", " ")}
                  </span>
                </div>
              ),
            },
            { key: "moq", header: "MOQ", cell: (p) => <span className="text-sm font-medium text-foreground/80">{p.moq} {p.unit}</span> },
            {
              key: "price_gst",
              header: "Price & GST",
              cell: (p) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{inr(p.wholesalePrice)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">GST {p.gstRate}%</span>
                </div>
              ),
            },
            {
              key: "stock",
              header: "Available Stock",
              cell: (p) => {
                const band = stockBand(p);
                const s = bandStyles[band];
                const pct = p.stock <= 0 ? 0 : 100;
                return (
                  <div className="min-w-[120px] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium", s.text)}>{p.stock === 0 ? "Out of Stock" : `${p.stock} ${p.unit}`}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted/60">
                      <div className={cn("h-full rounded-full transition-all duration-300", s.bar)} style={{ width: `${pct}%` }} />
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
              cell: (p) => <span className="text-xs text-muted-foreground/80">{new Date(p.updatedAt).toLocaleDateString()}</span>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (p) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/products/$id", params: { id: p.id } }); }}><Edit3 className="h-4 w-4" /></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border/80 shadow-elevated">
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
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { void remove(p.id).then(() => toast.success("Deleted")).catch((e: Error) => toast.error(e.message)); }}>
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
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:border-border/80 hover:-translate-y-0.5">
      <div className="flex items-center gap-3.5 mb-3">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl transition-colors", tint)}><Icon className="h-4 w-4" /></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</span>
      </div>
      <div className="text-3xl font-display font-bold tracking-tight text-foreground">{value}</div>
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
