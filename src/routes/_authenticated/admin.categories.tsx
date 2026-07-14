import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCatalog";
import { supabase } from "@/integrations/supabase/client";
import { mapCategoriesToAdmin } from "@/lib/catalogAdminMap";
import { slugifyProductName } from "@/lib/supplierProductMap";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategories();
  const items = useMemo(() => mapCategoriesToAdmin(categories), [categories]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const parents = items.filter((c) => !c.parent);
  const childrenOf = (id: string) => items.filter((c) => c.parent === id);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["catalog-categories"] });

  const remove = async (id: string) => {
    if (id.includes(":")) {
      toast.info("Sub-categories are stored on the parent category — edit the parent to change them.");
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await invalidate();
    toast("Category deleted");
  };

  const create = async () => {
    if (!name.trim()) return;
    const slug = slugifyProductName(name);
    const id = `c-${slug}`;
    const { error } = await supabase.from("categories").insert({
      id,
      slug,
      name: name.trim(),
      icon: "Store",
      image: "",
      product_count: 0,
      description: description.trim() || null,
      sub_categories: [],
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setDescription("");
    await invalidate();
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
                <div><Label>SEO description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Meta description shown on SERPs" /></div>
              </div>
              <DialogFooter><Button onClick={() => void create()}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : (
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
                    <Switch checked={parent.visible} onCheckedChange={() => toast.info("Visibility is controlled by listing data for now")} />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.info("Edit coming soon")}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => void remove(parent.id)}><Trash2 className="h-4 w-4" /></Button>
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
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.info("Edit the parent category to manage sub-categories")}>
                        {sub.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => void remove(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
          {parents.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories in the database yet.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
