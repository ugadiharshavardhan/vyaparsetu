import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Boxes, Package, MapPin, Search, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts, useStockMovements, useWarehouses } from "@/hooks/useSupplier";
import type { SupplierProduct, Warehouse } from "@/types/supplier";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Supplier" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { products } = useSupplierProducts();
  const { warehouses } = useWarehouses();
  const { movements, adjust } = useStockMovements();
  const [tab, setTab] = useState("stock");
  const [q, setQ] = useState("");

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const reserved = products.reduce((s, p) => s + p.reserved, 0);
  const available = totalUnits - reserved;
  const inventoryValue = products.reduce((s, p) => s + ((p.stock - p.reserved) * p.wholesalePrice), 0);
  const low = products.filter((p) => p.stock > 0 && p.stock <= (p.reorderLevel || 20));
  const out = products.filter((p) => p.stock === 0);

  const filteredProducts = products.filter((p) => {
    if (q && !`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader 
        title="Inventory Management" 
        description="Monitor stock levels, track movements, and manage warehouse locations." 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard title="Total Inventory" value={totalUnits} />
        <SummaryCard title="Available Stock" value={available} tone="text-success" />
        <SummaryCard title="Reserved Stock" value={reserved} tone="text-info" />
        <SummaryCard title="Low Stock Items" value={low.length} tone="text-warning" />
        <SummaryCard title="Out of Stock" value={out.length} tone="text-destructive" />
        <SummaryCard title="Inventory Value" value={inr(inventoryValue)} />
      </div>

      {(low.length > 0 || out.length > 0) && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-foreground">Attention Required</div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {out.length} items out of stock and {low.length} items below reorder level. Restock to avoid order delays.
              </p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 bg-background" onClick={() => setTab("alerts")}>View Alerts</Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="movements">Stock Movement</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="m-0 space-y-6">
          <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
            <div className="px-6 py-5 border-b border-border flex items-center bg-muted/5 rounded-t-2xl">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
                <Input className="pl-9.5 bg-background rounded-full border-border/70 h-10 shadow-sm" placeholder="Search by Product Name or SKU..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <DataTable<SupplierProduct>
              rows={filteredProducts}
              embedded={true}
              pageSize={10}
              columns={[
                {
                  key: "product",
                  header: "Product",
                  cell: (p) => (
                    <div className="flex items-center gap-3">
                      <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">SKU {p.sku} · {p.category}</div>
                      </div>
                    </div>
                  ),
                },
                { 
                  key: "wh", 
                  header: "Warehouse", 
                  cell: (p) => <span className="text-sm">{warehouses.find((w) => w.id === p.warehouseId)?.name ?? "—"}</span> 
                },
                { 
                  key: "avail", 
                  header: "Available", 
                  cell: (p) => <span className="font-bold text-foreground">{p.stock - p.reserved}</span> 
                },
                { 
                  key: "res", 
                  header: "Reserved", 
                  cell: (p) => <span className="text-muted-foreground">{p.reserved}</span> 
                },
                { 
                  key: "reorder", 
                  header: "Reorder Lvl", 
                  cell: (p) => <span className="text-muted-foreground">{p.reorderLevel || 20}</span> 
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (p) => (
                    <Pill tone={p.stock === 0 ? "danger" : p.stock <= (p.reorderLevel || 20) ? "warning" : "success"}>
                      {p.stock === 0 ? "Out of Stock" : p.stock <= (p.reorderLevel || 20) ? "Low Stock" : "Healthy"}
                    </Pill>
                  ),
                },
                { key: "updated", header: "Last Updated", cell: (p) => <span className="text-sm">{new Date(p.updatedAt).toLocaleDateString()}</span> },
                { 
                  key: "actions", 
                  header: "", 
                  className: "text-right", 
                  cell: (p) => <AdjustDialog product={p} onAdjust={adjust} /> 
                },
              ]}
              empty={<div className="py-8 text-center text-muted-foreground">No inventory items found.</div>}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="alerts" className="m-0 space-y-6">
          <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
            <div className="px-6 py-5 border-b border-border bg-muted/5">
              <h3 className="font-semibold text-base text-foreground">Low Stock Alerts</h3>
              <p className="text-xs text-muted-foreground mt-1">Products that have fallen below their minimum required reorder level.</p>
            </div>
            <DataTable<SupplierProduct>
              rows={[...out, ...low]}
              embedded={true}
              columns={[
                {
                  key: "product",
                  header: "Product",
                  cell: (p) => (
                    <div className="flex items-center gap-3">
                      <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">SKU {p.sku}</div>
                      </div>
                    </div>
                  ),
                },
                { key: "avail", header: "Current Stock", cell: (p) => <span className={cn("font-bold", p.stock === 0 ? "text-destructive" : "text-warning")}>{p.stock}</span> },
                { key: "reorder", header: "Minimum Required", cell: (p) => <span className="font-semibold">{p.reorderLevel || 20}</span> },
                { key: "suggested", header: "Suggested Restock", cell: (p) => <span className="font-semibold text-brand">+{(p.reorderLevel || 20) * 3 - p.stock}</span> },
                { key: "priority", header: "Priority", cell: (p) => <Pill tone={p.stock === 0 ? "danger" : "warning"}>{p.stock === 0 ? "Critical" : "High"}</Pill> },
                { key: "actions", header: "", className: "text-right", cell: (p) => <AdjustDialog product={p} onAdjust={adjust} isRestock /> },
              ]}
              empty={<div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3"><CheckCircleIcon className="h-12 w-12 text-success/20" />All stock levels are healthy!</div>}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="movements" className="m-0 space-y-6">
          <SectionCard title="Stock Movement Timeline" description="Track all additions, deductions, damages, and returns.">
            <div className="space-y-4 relative pl-4 border-l-2 border-border ml-4 mt-2">
              {movements.map((m) => (
                <div key={m.id} className="relative bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className={cn(
                    "absolute -left-[27px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background",
                    m.type === "restock" ? "bg-success" : m.type === "damaged" ? "bg-destructive" : m.type === "sale" ? "bg-info" : "bg-warning"
                  )}></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{m.productName}</span>
                        <Pill tone={m.type === "restock" ? "success" : m.type === "damaged" ? "danger" : m.type === "sale" ? "info" : "muted"} className="text-[10px] py-0.5">{m.type}</Pill>
                      </div>
                      <div className="text-sm text-muted-foreground">{m.note}</div>
                    </div>
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <div className={cn("font-bold text-lg", m.qty > 0 ? "text-success" : "text-destructive")}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="warehouses" className="m-0 space-y-6">
          <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
            <div className="px-6 py-5 border-b border-border bg-muted/5">
              <h3 className="font-semibold text-base text-foreground">Warehouse Management</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage storage locations and capacity.</p>
            </div>
            <DataTable<Warehouse>
              rows={warehouses}
              embedded={true}
              columns={[
                {
                  key: "name",
                  header: "Warehouse Name",
                  cell: (w) => (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <div className="text-xs text-muted-foreground">{w.city}, {w.state}</div>
                      </div>
                    </div>
                  ),
                },
                { key: "manager", header: "Manager", cell: (w) => <div className="text-sm"><div className="font-medium">{w.managerName}</div><div className="text-xs text-muted-foreground">{w.managerPhone}</div></div> },
                { 
                  key: "capacity", 
                  header: "Capacity Usage", 
                  cell: (w) => (
                    <div className="w-full max-w-[150px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{Math.round((w.used/w.capacity)*100)}% Used</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", (w.used/w.capacity) > 0.8 ? "bg-warning" : "bg-brand")} style={{ width: `${(w.used/w.capacity)*100}%` }}></div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 text-right">{w.used.toLocaleString()} / {w.capacity.toLocaleString()} items</div>
                    </div>
                  )
                },
                { key: "updated", header: "Added On", cell: (w) => <span className="text-sm">{new Date(w.createdAt).toLocaleDateString()}</span> },
                { key: "actions", header: "", className: "text-right", cell: () => <Button variant="ghost" size="sm" onClick={() => toast.info("Edit warehouse coming soon")}>Edit</Button> },
              ]}
              empty={<div className="py-8 text-center text-muted-foreground">No warehouses found.</div>}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ title, value, tone }: { title: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-xs font-medium text-muted-foreground mb-2 line-clamp-1">{title}</div>
      <div className={cn("text-2xl font-display font-bold", tone)}>{value}</div>
    </div>
  );
}

function CheckCircleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AdjustDialog({
  product,
  onAdjust,
  isRestock = false
}: {
  product: SupplierProduct;
  onAdjust: (p: SupplierProduct, qty: number, note: string, type?: "restock" | "adjustment" | "damaged") => void | Promise<void>;
  isRestock?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const available = product.stock - product.reserved;
  const [newStock, setNewStock] = useState(available);
  const [qty, setQty] = useState(isRestock ? Math.max(0, (product.reorderLevel || 20) * 3 - product.stock) : 0);
  const [note, setNote] = useState(isRestock ? "Supplier delivery received" : "");
  const [type, setType] = useState<"restock" | "adjustment" | "damaged">(isRestock ? "restock" : "adjustment");

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) {
        setNewStock(available);
        setQty(isRestock ? Math.max(0, (product.reorderLevel || 20) * 3 - product.stock) : 0);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isRestock ? "default" : "outline"} className={isRestock ? "bg-brand hover:bg-brand/90" : ""}>
          {isRestock ? <><RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Restock</> : "Update Stock"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Stock — {product.name}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
            <span>Current Available:</span>
            <span className="font-bold">{available}</span>
          </div>
          
          <div>
            <Label className="mb-2 block">Movement Type</Label>
            <div className="flex gap-2">
              <Button type="button" variant={type === "restock" ? "default" : "outline"} className={type === "restock" ? "bg-brand" : ""} onClick={() => { setType("restock"); setQty(Math.abs(qty) || 10); }}>Restock</Button>
              <Button type="button" variant={type === "adjustment" ? "default" : "outline"} onClick={() => { setType("adjustment"); setNewStock(available); }}>Adjustment</Button>
              <Button type="button" variant={type === "damaged" ? "default" : "outline"} className={type === "damaged" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""} onClick={() => { setType("damaged"); setQty(-Math.abs(qty) || -1); }}>Damaged</Button>
            </div>
          </div>

          {type === "adjustment" ? (
            <div>
              <Label className="mb-1 block">New stock count</Label>
              <Input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(Math.max(0, Number(e.target.value)))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Compared with current ({available}):{" "}
                {newStock === available
                  ? "no change"
                  : newStock > available
                    ? `increase by ${newStock - available}`
                    : `decrease by ${available - newStock}`}
              </p>
            </div>
          ) : (
            <div>
              <Label className="mb-1 block">Quantity Change</Label>
              <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder={type === "damaged" ? "-10" : "10"} />
              <p className="text-xs text-muted-foreground mt-1">Use negative values to reduce stock manually.</p>
            </div>
          )}
          
          <div>
            <Label className="mb-1 block">Note / Reason</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. PO#1234, Damaged in transit" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const delta = type === "adjustment" ? newStock - available : qty;
            if (delta === 0) { toast.error(type === "adjustment" ? "Enter a different stock count" : "Enter a non-zero quantity"); return; }
            void Promise.resolve(onAdjust(product, delta, note || "Manual update", type))
              .then(() => {
                toast.success(
                  delta > 0
                    ? `Stock increased by ${delta}`
                    : `Stock decreased by ${Math.abs(delta)}`,
                );
                setOpen(false);
                setQty(0); setNote("");
              })
              .catch((e: Error) => toast.error(e.message));
          }}>Apply Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
