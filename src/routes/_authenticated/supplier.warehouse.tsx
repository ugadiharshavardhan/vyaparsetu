import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Plus, Trash2, User, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSupplierProducts, useWarehouses } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/warehouse")({
  head: () => ({ meta: [{ title: "Warehouse — Supplier" }] }),
  component: WarehousePage,
});

function WarehousePage() {
  const { warehouses, create, remove } = useWarehouses();
  const { products } = useSupplierProducts();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", city: "", state: "", pincode: "",
    capacity: 5000, managerName: "", managerPhone: "",
  });

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Warehouses"
          description="Multi-node inventory across regions with live capacity tracking."
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" />New warehouse</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create warehouse</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name" span={2}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Address"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
                  <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                  <Field label="State"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
                  <Field label="Pincode"><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></Field>
                  <Field label="Capacity (units)"><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Field>
                  <Field label="Manager"><Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} /></Field>
                  <Field label="Manager phone" span={2}><Input value={form.managerPhone} onChange={(e) => setForm({ ...form, managerPhone: e.target.value })} /></Field>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    if (!form.name || !form.city) { toast.error("Name and city are required"); return; }
                    create(form);
                    toast.success("Warehouse created");
                    setOpen(false);
                    setForm({ name: "", location: "", city: "", state: "", pincode: "", capacity: 5000, managerName: "", managerPhone: "" });
                  }}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((w) => {
            const inventoryCount = products.filter((p) => p.warehouseId === w.id).length;
            const pct = Math.round((w.used / w.capacity) * 100);
            return (
              <div key={w.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><WarehouseIcon className="h-4 w-4" /></span>
                      <div>
                        <div className="font-display text-lg font-semibold">{w.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{w.city}, {w.state}</div>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { remove(w.id); toast.success("Warehouse deleted"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Capacity utilisation</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                  <div className="text-xs text-muted-foreground">{w.used.toLocaleString()} of {w.capacity.toLocaleString()} units</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Available space</div>
                    <div className="font-semibold">{(w.capacity - w.used).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">SKUs</div>
                    <div className="font-semibold">{inventoryCount}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {w.managerName} • {w.managerPhone}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    
  );
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
