import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy, Download, Edit3, Filter, MoreVertical, Package, Plus, Search,
  Sparkles, Tag, Trash2, TrendingUp, Upload, Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const bandStyles: Record<StockBand, { bar: string; text: string; label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  healthy: { bar: "bg-success", text: "text-success", label: "Healthy", tone: "success" },
  medium:  { bar: "bg-warning", text: "text-warning", label: "Medium", tone: "warning" },
  low:     { bar: "bg-[color:hsl(25_95%_53%)]", text: "text-[color:hsl(25_95%_45%)]", label: "Low", tone: "warning" },
  out:     { bar: "bg-destructive", text: "text-destructive", label: "Out", tone: "danger" },
};

function SupplierProductsPage() {
  const { products, remove, duplicate, updateProduct } = useSupplierProducts();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [price, setPrice] = useState("all");

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === "published" && p.visible).length,
    inStock: products.filter((p) => p.stock >= 25).length,
    low: products.filter((p) => p.stock > 0 && p.stock < 25).length,
    drafts: products.filter((p) => p.status === "draft").length,
  };

  const filtered = products.filter((p) => {
    if (tab === "active" && !(p.status === "published" && p.visible)) return false;
    if (tab === "instock" && p.stock < 25) return false;
    if (tab === "low" && !(p.stock > 0 && p.stock < 25)) return false;
    if (tab === "drafts" && p.status !== "draft") return false;
    if (cat !== "all" && p.category !== cat) return false;
    if (status !== "all" && p.status !== status) return false;
    if (price === "under100" && p.wholesalePrice >= 100) return false;
    if (price === "100to500" && (p.wholesalePrice < 100 || p.wholesalePrice > 500)) return false;
    if (price === "over500" && p.wholesalePrice <= 500) return false;
    if (q && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.wholesalePrice, 0);
  const avgPrice = products.length ? products.reduce((s, p) => s + p.wholesalePrice, 0) / products.length : 0;
  const topCategory = categories.map((c) => ({ c, n: products.filter((p) => p.category === c).length })).sort((a, b) => b.n - a.n)[0];

  return (
    <DashboardLayout>
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Product Management"
          description="Manage products, inventory, pricing and stock."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled title="Coming soon" onClick={() => toast.info("Bulk upload — coming soon")}><Upload className="mr-1.5 h-4 w-4" /> Bulk upload <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">Soon</span></Button>
              <Button variant="outline" onClick={() => toast.info("Export queued")}><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
              <Button asChild><Link to="/supplier/products/new"><Plus className="mr-1.5 h-4 w-4" /> Add product</Link></Button>
            </div>
          }
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All products ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="instock">In stock ({counts.inStock})</TabsTrigger>
            <TabsTrigger value="low">Low stock ({counts.low})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({counts.drafts})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search products, SKUs, brands" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="lg:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("-", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={price} onValueChange={setPrice}>
            <SelectTrigger className="lg:w-40"><SelectValue placeholder="Price" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any price</SelectItem>
              <SelectItem value="under100">Under ₹100</SelectItem>
              <SelectItem value="100to500">₹100 – ₹500</SelectItem>
              <SelectItem value="over500">Over ₹500</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.info("More filters coming soon")}><Filter className="mr-1.5 h-4 w-4" /> More filters</Button>
        </div>

        <DataTable<SupplierProduct>
          rows={filtered}
          columns={[
            {
              key: "product",
              header: "Product",
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-12 w-12 rounded-lg border border-border object-cover" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} · SKU {p.sku}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              cell: (p) => (
                <span className="inline-flex items-center rounded-full bg-info-soft px-2.5 py-0.5 text-[11px] font-semibold capitalize text-info">
                  {p.category.replace("-", " ")}
                </span>
              ),
            },
            { key: "moq", header: "MOQ", cell: (p) => <span className="text-sm font-medium">{p.moq} {p.unit}</span> },
            {
              key: "stock",
              header: "Stock",
              cell: (p) => {
                const band = stockBand(p);
                const s = bandStyles[band];
                const pct = Math.min(100, (p.stock / 200) * 100);
                return (
                  <div className="min-w-[140px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-semibold", s.text)}>{p.stock === 0 ? "Out" : `${p.stock} ${p.unit}`}</span>
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              },
            },
            { key: "price", header: "Unit price", cell: (p) => (
              <div>
                <div className="font-semibold">{inr(p.wholesalePrice)}</div>
                <div className="text-[11px] text-muted-foreground line-through">{inr(p.mrp)}</div>
              </div>
            )},
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
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/products/$id", params: { id: p.id } }); }}>View</Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/products/$id", params: { id: p.id } }); }}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </div>
              ),
            },
          ]}
          onRowClick={(p) => navigate({ to: "/supplier/products/$id", params: { id: p.id } })}
          empty={<div className="space-y-3 py-6 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="font-semibold">No products match your filters</div>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">Try clearing filters or add a new SKU to your catalog.</p>
            <Button asChild><Link to="/supplier/products/new">Add product</Link></Button>
          </div>}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            icon={TrendingUp}
            tint="bg-brand-soft text-brand"
            title="Business insights"
            body={`You have ${counts.active} active SKUs. Adding ${Math.max(3, 10 - counts.active)} more can grow discovery by ~18%.`}
          />
          <InsightCard
            icon={Boxes}
            tint="bg-success-soft text-success"
            title="Inventory insights"
            body={`${totalStock.toLocaleString("en-IN")} units on hand, worth ${inr(inventoryValue)}. ${counts.low} SKUs need restocking soon.`}
          />
          <InsightCard
            icon={Tag}
            tint="bg-info-soft text-info"
            title="Pricing insights"
            body={`Average wholesale price is ${inr(Math.round(avgPrice))}. Bundle bulk pricing on your top 5 SKUs to lift AOV.`}
          />
          <InsightCard
            icon={Sparkles}
            tint="bg-warning-soft text-warning"
            title="Marketplace trends"
            body={`${topCategory?.c.replace("-", " ") ?? "Groceries"} is your fastest growing category with ${topCategory?.n ?? 0} SKUs.`}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function InsightCard({ icon: Icon, tint, title, body }: { icon: React.ComponentType<{ className?: string }>; tint: string; title: string; body: string }) {
  return (
    <SectionCard title={title}>
      <div className="flex gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tint)}><Icon className="h-4 w-4" /></span>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </SectionCard>
  );
}
