import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { ImageManager } from "./ImageManager";
import type { SupplierProduct } from "@/types/supplier";
import { useWarehouses } from "@/hooks/useSupplier";
import { useCategories } from "@/hooks/useCatalog";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const UNITS = ["bag", "carton", "case", "pack", "box", "piece", "kg", "litre"];
const STEPS = ["Basic Info", "Pricing", "Inventory & Shipping", "Images", "Review"];

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
  manufacturerName: "",
  weight: "",
  dimensions: "",
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
  const [step, setStep] = useState(0);

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

  const validateStep = (s: number) => {
    if (s === 0) return draft.name.trim() !== "" && draft.sku.trim() !== "";
    if (s === 1) return draft.wholesalePrice > 0;
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(STEPS.length - 1, s + 1));
    else toast.error("Please fill all required fields before proceeding.");
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const submit = (status: SupplierProduct["status"]) => {
    if (!draft.name || !draft.sku || !draft.wholesalePrice) {
      toast.error("Name, SKU and wholesale price are required");
      return;
    }
    onSubmit({ ...draft, status });
  };

  return (

    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="relative flex flex-col items-center">
              <div
                className={cn(
                  "z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step === i
                    ? "bg-brand text-white shadow-md"
                    : step > i
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("mt-2 hidden text-xs font-medium sm:block", step === i ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
          ))}
          <div className="absolute left-[10%] top-4 -z-10 h-0.5 w-[80%] bg-muted">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Basic Information</h2>
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
              <Field label="Manufacturer Name">
                <Input value={draft.manufacturerName ?? ""} onChange={(e) => set("manufacturerName", e.target.value)} />
              </Field>
              <Field label="Country of origin">
                <Input value={draft.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Pricing & Packaging</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Wholesale price (₹)" required>
                <Input type="number" value={draft.wholesalePrice || ""} onChange={(e) => set("wholesalePrice", Number(e.target.value))} />
              </Field>
              <Field label="Retail Price / MRP (₹)">
                <Input type="number" value={draft.mrp || ""} onChange={(e) => set("mrp", Number(e.target.value))} />
              </Field>
              <Field label="GST %">
                <Input type="number" value={draft.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))} />
              </Field>
              <Field label="Unit">
                <Select value={draft.unit} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Package size">
                <Input value={draft.packageSize} onChange={(e) => set("packageSize", e.target.value)} placeholder="e.g. 10 kg bag" />
              </Field>
              <Field label="Minimum order qty (MOQ)">
                <Input type="number" value={draft.moq} onChange={(e) => set("moq", Number(e.target.value))} />
              </Field>
              <Field label="Maximum order qty">
                <Input type="number" value={draft.maxOrderQty ?? ""} onChange={(e) => set("maxOrderQty", e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Inventory & Shipping</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Available Stock">
                <Input type="number" value={draft.stock || ""} onChange={(e) => set("stock", Number(e.target.value))} />
              </Field>
              <Field label="Warehouse">
                <Select value={draft.warehouseId} onValueChange={(v) => set("warehouseId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Delivery time (days)">
                <Input type="number" value={draft.deliveryDays} onChange={(e) => set("deliveryDays", Number(e.target.value))} />
              </Field>
              <Field label="Weight">
                <Input value={draft.weight ?? ""} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 1.5 kg" />
              </Field>
              <Field label="Dimensions">
                <Input value={draft.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} placeholder="L x W x H" />
              </Field>
              <Field label="Return policy">
                <Input value={draft.returnPolicy} onChange={(e) => set("returnPolicy", e.target.value)} />
              </Field>
              <Field label="Warranty">
                <Input value={draft.warranty} onChange={(e) => set("warranty", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Product Images</h2>
            <p className="text-sm text-muted-foreground">Upload multiple high-quality images. The first image will be used as the thumbnail.</p>
            <ImageManager
              images={draft.images}
              thumbnailIndex={draft.thumbnailIndex}
              onChange={({ images, thumbnailIndex }) => setDraft((d) => ({ ...d, images, thumbnailIndex }))}
            />
            <Field label="Product video URL (optional)">
              <Input value={draft.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Review & Publish</h2>
            <SectionCard title="Visibility Settings">
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow label="Visible in marketplace" value={draft.visible} onChange={(v) => set("visible", v)} />
                <ToggleRow label="Feature on homepage" value={draft.featured} onChange={(v) => set("featured", v)} />
              </div>
            </SectionCard>

            <SectionCard title="Product Summary">
              <div className="grid grid-cols-2 gap-y-2 text-sm md:grid-cols-4">
                <div className="text-muted-foreground">Name:</div>
                <div className="font-semibold">{draft.name || "—"}</div>
                <div className="text-muted-foreground">SKU:</div>
                <div className="font-semibold">{draft.sku || "—"}</div>
                <div className="text-muted-foreground">Wholesale Price:</div>
                <div className="font-semibold">₹{draft.wholesalePrice}</div>
                <div className="text-muted-foreground">MOQ:</div>
                <div className="font-semibold">{draft.moq} {draft.unit}</div>
                <div className="text-muted-foreground">Stock:</div>
                <div className="font-semibold">{draft.stock}</div>
                <div className="text-muted-foreground">Images:</div>
                <div className="font-semibold">{draft.images.length} added</div>
              </div>
            </SectionCard>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep} className="shadow-brand">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => submit("draft")}>Save as Draft</Button>
              <Button onClick={() => submit("published")} className="shadow-brand bg-brand">{submitLabel}</Button>
            </div>
          )}
        </div>
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
    <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
