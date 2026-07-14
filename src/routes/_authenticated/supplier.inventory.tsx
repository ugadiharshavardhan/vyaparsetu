import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Boxes, Package } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierProducts, useStockMovements, useWarehouses } from "@/hooks/useSupplier";
import type { SupplierProduct } from "@/types/supplier";

export const Route = createFileRoute("/_authenticated/supplier/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Supplier" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { products } = useSupplierProducts();
  const { warehouses } = useWarehouses();
  const { movements, adjust } = useStockMovements();
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const reserved = products.reduce((s, p) => s + p.reserved, 0);
  const available = totalUnits - reserved;
  const incoming = products.reduce((s, p) => s + p.incoming, 0);
  const low = products.filter((p) => p.stock > 0 && p.stock < 25);
  const out = products.filter((p) => p.stock === 0);

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Inventory" description="Track stock levels, reservations, and warehouse movements in real-time." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total units" value={String(totalUnits)} hint="All warehouses" icon={Boxes} tone="brand" />
          <StatCard label="Available" value={String(available)} hint="Sellable" icon={Package} tone="success" delay={0.05} />
          <StatCard label="Reserved" value={String(reserved)} hint="In orders" icon={Boxes} tone="info" delay={0.1} />
          <StatCard label="Incoming" value={String(incoming)} hint="PO in transit" icon={ArrowDown} tone="warning" delay={0.15} />
        </div>

        {(low.length > 0 || out.length > 0) && (
          <div className="rounded-2xl border border-warning/40 bg-warning-soft/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <div>
                <div className="font-semibold">Stock alerts</div>
                <p className="text-sm text-muted-foreground">
                  {out.length} out of stock • {low.length} low stock. Restock soon to avoid missed orders.
                </p>
              </div>
            </div>
          </div>
        )}

        <SectionCard title="Stock levels" description="Adjust quantities and track reservations">
          <DataTable<SupplierProduct>
            rows={products}
            columns={[
              {
                key: "product",
                header: "Product",
                cell: (p) => (
                  <div className="flex items-center gap-3">
                    <img src={p.images[p.thumbnailIndex] ?? p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">SKU {p.sku}</div>
                    </div>
                  </div>
                ),
              },
              { key: "wh", header: "Warehouse", cell: (p) => warehouses.find((w) => w.id === p.warehouseId)?.name ?? "—" },
              { key: "stock", header: "Stock", cell: (p) => <span className="font-semibold">{p.stock}</span> },
              { key: "res", header: "Reserved", cell: (p) => p.reserved },
              { key: "avail", header: "Available", cell: (p) => <span className="font-semibold text-brand">{p.stock - p.reserved}</span> },
              { key: "incoming", header: "Incoming", cell: (p) => p.incoming },
              {
                key: "status",
                header: "Status",
                cell: (p) => (
                  <Pill tone={p.stock === 0 ? "danger" : p.stock < 25 ? "warning" : "success"}>
                    {p.stock === 0 ? "Out" : p.stock < 25 ? "Low" : "Healthy"}
                  </Pill>
                ),
              },
              { key: "adjust", header: "", className: "text-right", cell: (p) => <AdjustDialog product={p} onAdjust={adjust} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Inventory history" description="Recent stock movements">
          <ul className="space-y-2">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${m.qty >= 0 ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive"}`}>
                  {m.qty >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.productName}</div>
                  <div className="text-xs text-muted-foreground">{m.note} • {new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <span className="text-sm font-semibold">{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
                <Pill tone="muted">{m.type}</Pill>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    
  );
}

function AdjustDialog({
  product,
  onAdjust,
}: {
  product: SupplierProduct;
  onAdjust: (p: SupplierProduct, qty: number, note: string, type?: "restock" | "adjustment") => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Adjust</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adjust stock — {product.name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quantity change</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="Positive to add, negative to remove" />
          </div>
          <div>
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. restock, damage, correction" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            if (qty === 0) { toast.error("Enter a non-zero quantity"); return; }
            void Promise.resolve(onAdjust(product, qty, note || "Manual adjustment", qty > 0 ? "restock" : "adjustment"))
              .then(() => {
                toast.success("Stock updated");
                setOpen(false);
                setQty(0); setNote("");
              })
              .catch((e: Error) => toast.error(e.message));
          }}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
