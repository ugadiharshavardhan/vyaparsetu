import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { adminBanners, type AdminBanner } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: "Banners — Admin" }] }),
  component: BannersPage,
});

function BannersPage() {
  const [items, setItems] = useState(adminBanners);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", placement: "homepage" as AdminBanner["placement"], starts: "", ends: "" });

  const columns: AdminColumn<AdminBanner>[] = [
    { key: "title", header: "Banner", render: (b) => <span className="font-semibold">{b.title}</span> },
    { key: "placement", header: "Placement", render: (b) => <Pill tone="info">{b.placement}</Pill> },
    { key: "starts", header: "Starts", render: (b) => <span className="text-xs text-muted-foreground">{b.starts || "—"}</span> },
    { key: "ends", header: "Ends", render: (b) => <span className="text-xs text-muted-foreground">{b.ends || "—"}</span> },
    { key: "impressions", header: "Impressions", render: (b) => <span className="text-sm">{b.impressions.toLocaleString("en-IN")}</span> },
    { key: "clicks", header: "Clicks", render: (b) => <span className="text-sm">{b.clicks.toLocaleString("en-IN")}</span> },
    { key: "ctr", header: "CTR", render: (b) => <span className="text-sm">{b.impressions ? `${((b.clicks / b.impressions) * 100).toFixed(2)}%` : "—"}</span> },
    { key: "status", header: "Status", render: (b) => <Pill tone={b.status === "live" ? "success" : b.status === "scheduled" ? "info" : b.status === "expired" ? "muted" : "warning"}>{b.status}</Pill> },
    {
      key: "actions", header: "", className: "text-right", render: (b) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.info("Preview coming soon")}><Eye className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setItems((all) => all.filter((x) => x.id !== b.id)); toast("Banner deleted"); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const create = () => {
    if (!form.title) return toast.error("Title required");
    setItems((all) => [...all, { id: `bn-${Date.now()}`, ...form, status: "draft", clicks: 0, impressions: 0 }]);
    toast.success("Banner created");
    setOpen(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Banners"
        description="Homepage, category, campaign and popup banners with scheduling."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Upload banner</Button></DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  create();
                }}
              >
                <DialogHeader><DialogTitle>New banner</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div>
                  <Label>Placement</Label>
                  <Select value={form.placement} onValueChange={(v: AdminBanner["placement"]) => setForm({ ...form, placement: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Starts</Label><Input type="date" value={form.starts} onChange={(e) => setForm({ ...form, starts: e.target.value })} /></div>
                  <div><Label>Ends</Label><Input type="date" value={form.ends} onChange={(e) => setForm({ ...form, ends: e.target.value })} /></div>
                </div>
                <div><Label>Image</Label><Input type="file" /></div>
              </div>
              <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <AdminTable rows={items} columns={columns} getRowId={(b) => b.id} searchable={(b) => `${b.title} ${b.placement}`} />
    </AdminLayout>
  );
}
