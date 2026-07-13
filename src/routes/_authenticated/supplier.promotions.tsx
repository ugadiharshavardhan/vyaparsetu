import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { usePromotions } from "@/hooks/useSupplier";
import type { Promotion } from "@/types/supplier";

export const Route = createFileRoute("/_authenticated/supplier/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Supplier" }] }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { promotions, create, toggle, remove } = usePromotions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Promotion, "id" | "redemptions">>({
    name: "", type: "percentage", value: 10, code: "", startsAt: new Date().toISOString().slice(0, 10),
    endsAt: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10), active: true, scope: "Storewide",
  });

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Promotions"
          description="Design percentage, flat, category or BOGO promos with schedule-based activation."
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" />New promotion</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create promotion</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name" span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Coupon code" span><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
                  <Field label="Type">
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Promotion["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage off</SelectItem>
                        <SelectItem value="flat">Flat amount off</SelectItem>
                        <SelectItem value="category">Category discount</SelectItem>
                        <SelectItem value="bxgy">Buy X get Y (placeholder)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Value">
                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                  </Field>
                  <Field label="Scope"><Input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></Field>
                  <Field label="Active">
                    <div className="flex h-10 items-center rounded-md border border-input px-3">
                      <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                    </div>
                  </Field>
                  <Field label="Starts"><Input type="date" value={form.startsAt.slice(0, 10)} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></Field>
                  <Field label="Ends"><Input type="date" value={form.endsAt.slice(0, 10)} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></Field>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    if (!form.name || !form.code) { toast.error("Name and code required"); return; }
                    create(form);
                    toast.success("Promotion created");
                    setOpen(false);
                  }}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <DataTable<Promotion>
          rows={promotions}
          columns={[
            { key: "n", header: "Name", cell: (p) => <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">Code {p.code}</div></div> },
            { key: "t", header: "Type", cell: (p) => <Pill tone="info">{p.type}</Pill> },
            { key: "v", header: "Value", cell: (p) => <span className="font-semibold">{p.type === "percentage" ? `${p.value}%` : `₹${p.value}`}</span> },
            { key: "sc", header: "Scope", cell: (p) => p.scope },
            { key: "sched", header: "Schedule", cell: (p) => <span className="text-xs text-muted-foreground">{new Date(p.startsAt).toLocaleDateString()} → {new Date(p.endsAt).toLocaleDateString()}</span> },
            { key: "red", header: "Redemptions", cell: (p) => p.redemptions },
            { key: "act", header: "Status", cell: (p) => <div className="flex items-center gap-2"><Switch checked={p.active} onCheckedChange={() => toggle(p.id)} /><Pill tone={p.active ? "success" : "muted"}>{p.active ? "Active" : "Paused"}</Pill></div> },
            { key: "rm", header: "", className: "text-right", cell: (p) => <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button> },
          ]}
        />
      </div>
    
  );
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
