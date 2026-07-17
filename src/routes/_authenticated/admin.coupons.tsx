import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminCoupons, type AdminCoupon } from "@/data/admin";
import { Percent, Tag, TrendingUp } from "lucide-react";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const [items, setItems] = useState(adminCoupons);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "flat", value: 10, minOrder: 1000, expiry: "" });
  const [open, setOpen] = useState(false);

  const totalUsage = items.reduce((s, c) => s + c.usage, 0);
  const active = items.filter((c) => c.active).length;

  const toggle = (id: string) => setItems((all) => all.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  const remove = (id: string) => { setItems((all) => all.filter((c) => c.id !== id)); toast("Coupon deleted"); };
  const create = () => {
    if (!form.code) return toast.error("Code required");
    setItems((all) => [...all, { id: `cp-${Date.now()}`, ...form, usage: 0, cap: 1000, active: true }]);
    toast.success("Coupon created");
    setOpen(false);
  };

  const columns: AdminColumn<AdminCoupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-bold">{c.code}</span> },
    { key: "type", header: "Type", render: (c) => <Pill tone="info">{c.type === "percent" ? `${c.value}%` : inr(c.value)}</Pill> },
    { key: "min", header: "Min. order", render: (c) => <span className="text-sm">{inr(c.minOrder)}</span> },
    { key: "usage", header: "Usage", render: (c) => <span className="text-sm">{c.usage} / {c.cap}</span> },
    { key: "expiry", header: "Expires", render: (c) => <span className="text-xs text-muted-foreground">{c.expiry}</span> },
    { key: "active", header: "Active", render: (c) => <Switch checked={c.active} onCheckedChange={() => toggle(c.id)} /> },
    {
      key: "actions", header: "", className: "text-right", render: (c) => (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Coupons"
        description="Create, schedule and analyse discount coupons."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New coupon</Button></DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  create();
                }}
              >
                <DialogHeader><DialogTitle>Create coupon</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DIWALI25" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v: "percent" | "flat") => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="percent">Percent</SelectItem><SelectItem value="flat">Flat</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Value</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Min. order</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} /></div>
                  <div><Label>Expiry</Label><Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active coupons" value={String(active)} hint="Live now" icon={Tag} tone="brand" />
        <StatCard label="Total redemptions" value={totalUsage.toLocaleString("en-IN")} hint="All time" icon={TrendingUp} tone="success" delay={0.05} />
        <StatCard label="Avg. discount" value="12.6%" hint="Blended" icon={Percent} tone="info" delay={0.1} />
        <StatCard label="Total codes" value={String(items.length)} hint="Live + expired" icon={Tag} tone="warning" delay={0.15} />
      </div>

      <AdminTable rows={items} columns={columns} getRowId={(c) => c.id} searchable={(c) => c.code} searchPlaceholder="Search codes…" />
    </AdminLayout>
  );
}
