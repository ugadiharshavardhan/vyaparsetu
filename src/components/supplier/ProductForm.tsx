import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ImageManager } from "./ImageManager";
import type { SupplierProduct } from "@/types/supplier";
import { useWarehouses } from "@/hooks/useSupplier";
import { useCategories } from "@/hooks/useCatalog";

const UNITS = ["bag", "carton", "case", "pack", "box", "piece", "kg", "litre"];

type Draft = Omit<SupplierProduct, "id" | "createdAt" | "updatedAt">;

export const emptyDraft = (warehouseId = "", categorySlug = ""): Draft => ({
  name: "",
  brand: "",
  sku: "",
  hsn: "",
  category: categorySlug,
  subCategory: "",
  gstRate: 18,
  description: "",
  highlights: [],
  specifications: {},
  countryOfOrigin: "India",
  images: [],
  thumbnailIndex: 0,
  moq: 1,
  maxOrderQty: undefined,
  unit: "pack",
  packageSize: "",
  wholesalePrice: 0,
  mrp: 0,
  stock: 0,
  reserved: 0,
  incoming: 0,
  warehouseId,
  deliveryDays: 3,
  returnPolicy: "7-day return for damaged packaging",
  warranty: "N/A",
  featured: false,
  visible: true,
  status: "draft",
});

export function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save product",
}: {
  initial: Draft;
  onSubmit: (draft: Draft) => void;
  submitLabel?: string;
}) {
  const { warehouses } = useWarehouses();
  const { data: categories = [] } = useCategories();
  const [draft, setDraft] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    if (!draft.category && categories[0]?.slug) {
      set("category", categories[0].slug);
    }
  }, [categories, draft.category]);

  const selectedCategory = categories.find((c) => c.slug === draft.category);
  const subCategories = selectedCategory?.subCategories ?? [];

  const [highlightInput, setHighlightInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    set("highlights", [...draft.highlights, highlightInput.trim()]);
    setHighlightInput("");
  };
  const addSpec = () => {
    if (!specKey.trim()) return;
    set("specifications", { ...draft.specifications, [specKey.trim()]: specVal.trim() });
    setSpecKey("");
    setSpecVal("");
  };

  const submit = (status: SupplierProduct["status"]) => {
    if (!draft.name || !draft.sku || !draft.wholesalePrice) {
      toast.error("Name, SKU and wholesale price are required");
      return;
    }
    onSubmit({ ...draft, status });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Basics" description="Product identity and classification">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product name" required>
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Brand">
            <Input value={draft.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <Field label="SKU" required>
            <Input value={draft.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} />
          </Field>
          <Field label="HSN code">
            <Input value={draft.hsn} onChange={(e) => set("hsn", e.target.value)} />
          </Field>
          <Field label="Category">
            <Select
              value={draft.category || categories[0]?.slug || ""}
              onValueChange={(v) => {
                set("category", v);
                set("subCategory", "");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Sub-category">
            {subCategories.length > 0 ? (
              <Select value={draft.subCategory || undefined} onValueChange={(v) => set("subCategory", v)}>
                <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
                <SelectContent>
                  {subCategories.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={draft.subCategory} onChange={(e) => set("subCategory", e.target.value)} placeholder="Optional" />
            )}
          </Field>
          <Field label="GST %">
            <Input type="number" value={draft.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))} />
          </Field>
          <Field label="Country of origin">
            <Input value={draft.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Description" description="Tell buyers what makes this product great">
        <Field label="Description">
          <Textarea rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Highlights</Label>
            <div className="mt-2 flex gap-2">
              <Input value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)} placeholder="Add a highlight" />
              <Button type="button" variant="outline" onClick={addHighlight}>Add</Button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {draft.highlights.map((h, i) => (
                <li key={i} className="rounded-full bg-muted px-3 py-1 text-xs">{h}
                  <button type="button" className="ml-2 text-muted-foreground" onClick={() => set("highlights", draft.highlights.filter((_, j) => j !== i))}>×</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label>Specifications</Label>
            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key" />
              <Input value={specVal} onChange={(e) => setSpecVal(e.target.value)} placeholder="Value" />
              <Button type="button" variant="outline" onClick={addSpec}>Add</Button>
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              {Object.entries(draft.specifications).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5">
                  <span><span className="font-semibold">{k}:</span> {v}</span>
                  <button type="button" onClick={() => {
                    const next = { ...draft.specifications };
                    delete next[k];
                    set("specifications", next);
                  }}>×</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Media" description="High-quality images convert. Drag to reorder.">
        <ImageManager
          images={draft.images}
          thumbnailIndex={draft.thumbnailIndex}
          onChange={({ images, thumbnailIndex }) => setDraft((d) => ({ ...d, images, thumbnailIndex }))}
        />
        <Separator className="my-4" />
        <Field label="Product video URL (optional)">
          <Input value={draft.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
        </Field>
      </SectionCard>

      <SectionCard title="Pricing & packaging">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Wholesale price (₹)" required>
            <Input type="number" value={draft.wholesalePrice} onChange={(e) => set("wholesalePrice", Number(e.target.value))} />
          </Field>
          <Field label="MRP (₹)">
            <Input type="number" value={draft.mrp} onChange={(e) => set("mrp", Number(e.target.value))} />
          </Field>
          <Field label="Unit">
            <Select value={draft.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Package size">
            <Input value={draft.packageSize} onChange={(e) => set("packageSize", e.target.value)} placeholder="e.g. 10 kg bag" />
          </Field>
          <Field label="Minimum order qty">
            <Input type="number" value={draft.moq} onChange={(e) => set("moq", Number(e.target.value))} />
          </Field>
          <Field label="Maximum order qty">
            <Input type="number" value={draft.maxOrderQty ?? ""} onChange={(e) => set("maxOrderQty", e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Inventory & fulfilment">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Stock quantity">
            <Input type="number" value={draft.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </Field>
          <Field label="Incoming stock">
            <Input type="number" value={draft.incoming} onChange={(e) => set("incoming", Number(e.target.value))} />
          </Field>
          <Field label="Delivery time (days)">
            <Input type="number" value={draft.deliveryDays} onChange={(e) => set("deliveryDays", Number(e.target.value))} />
          </Field>
          <Field label="Warehouse">
            <Select value={draft.warehouseId} onValueChange={(v) => set("warehouseId", v)}>
              <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Return policy">
            <Input value={draft.returnPolicy} onChange={(e) => set("returnPolicy", e.target.value)} />
          </Field>
          <Field label="Warranty">
            <Input value={draft.warranty} onChange={(e) => set("warranty", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Visibility">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleRow label="Visible in marketplace" value={draft.visible} onChange={(v) => set("visible", v)} />
          <ToggleRow label="Feature on homepage" value={draft.featured} onChange={(v) => set("featured", v)} />
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => submit("draft")}>Save as draft</Button>
        <Button onClick={() => submit("published")}>{submitLabel}</Button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
