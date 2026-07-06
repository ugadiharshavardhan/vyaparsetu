import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill } from "@/components/supplier/Pill";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminCategories, type AdminCategory } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [items, setItems] = useState(adminCategories);
  const [name, setName] = useState("");

  const parents = items.filter((c) => !c.parent);
  const childrenOf = (id: string) => items.filter((c) => c.parent === id);

  const toggle = (id: string) => setItems((all) => all.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  const remove = (id: string) => { setItems((all) => all.filter((c) => c.id !== id && c.parent !== id)); toast("Category deleted"); };
  const create = () => {
    if (!name.trim()) return;
    setItems((all) => [...all, { id: `cat-${Date.now()}`, name, parent: null, products: 0, visible: true, order: all.length + 1 }]);
    setName("");
    toast.success("Category created");
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Categories"
        description="Manage the marketplace taxonomy — parents, sub-categories, SEO and ordering."
        action={
          <Dialog>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create category</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grains & Pulses" /></div>
                <div><Label>SEO description</Label><Textarea placeholder="Meta description shown on SERPs" /></div>
                <div><Label>Icon / banner</Label><Input type="file" /></div>
              </div>
              <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4">
        {parents.map((parent) => (
          <SectionCard key={parent.id} title={parent.name} description={`${parent.products} products · ${childrenOf(parent.id).length} sub-categories`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{parent.name}</span>
                  <Pill tone={parent.visible ? "success" : "muted"}>{parent.visible ? "Visible" : "Hidden"}</Pill>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={parent.visible} onCheckedChange={() => toggle(parent.id)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.info("Edit coming soon")}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(parent.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {childrenOf(parent.id).map((sub) => (
                <div key={sub.id} className="ml-6 flex items-center justify-between rounded-xl border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{sub.name}</span>
                    <span className="text-xs text-muted-foreground">· {sub.products} products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggle(sub.id)}>
                      {sub.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </AdminLayout>
  );
}
