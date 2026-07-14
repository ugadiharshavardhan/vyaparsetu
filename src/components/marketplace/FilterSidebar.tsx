import { Filter } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SUPPLIERS } from "@/data/suppliers";
import type { Category, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useCategories, useProducts } from "@/hooks/useCatalog";

export type Filters = {
  category: string | null;
  subCategory: string | null;
  priceMax: number;
  moqMax: number;
  minRating: number;
  maxDeliveryDays: number | null;
  location: string;
  brands: string[];
  suppliers: string[];
  gstRates: number[];
  verifiedOnly: boolean;
  gstOnly: boolean;
  inStockOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  category: null,
  subCategory: null,
  priceMax: 10000,
  moqMax: 50,
  minRating: 0,
  maxDeliveryDays: null,
  location: "",
  brands: [],
  suppliers: [],
  gstRates: [],
  verifiedOnly: false,
  gstOnly: false,
  inStockOnly: true,
};

const GST_RATES = [0, 5, 12, 18];
const DELIVERY_OPTIONS = [
  { label: "Any", value: null },
  { label: "1 day", value: 1 },
  { label: "≤ 2 days", value: 2 },
  { label: "≤ 3 days", value: 3 },
  { label: "≤ 5 days", value: 5 },
] as const;

export function FilterSidebar({
  filters,
  onChange,
  hideCategoryList = false,
  lockedCategory = null,
  products: productsProp,
  categories: categoriesProp,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  /** Hide the main category list (used on dedicated category pages). */
  hideCategoryList?: boolean;
  /** When set, subcategory chips come from this category's taxonomy. */
  lockedCategory?: string | null;
  products?: Product[];
  categories?: Category[];
}) {
  const { data: fetchedProducts = [] } = useProducts();
  const { data: fetchedCategories = [] } = useCategories();
  const PRODUCTS = productsProp ?? fetchedProducts;
  const CATEGORIES = categoriesProp ?? fetchedCategories;

  const toggleArr = <K extends keyof Filters>(key: K, value: Filters[K] extends Array<infer U> ? U : never) => {
    const arr = filters[key] as unknown as unknown[];
    const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
    onChange({ ...filters, [key]: next } as Filters);
  };

  const activeCategory = lockedCategory ?? filters.category;

  const scopedProducts = useMemo(
    () => (activeCategory ? PRODUCTS.filter((p) => p.category === activeCategory) : PRODUCTS),
    [PRODUCTS, activeCategory],
  );

  const brands = useMemo(
    () => Array.from(new Set(scopedProducts.map((p) => p.brand))).sort(),
    [scopedProducts],
  );

  const subCategories = useMemo(() => {
    if (!activeCategory) return [];
    const fromTaxonomy = CATEGORIES.find((c) => c.slug === activeCategory)?.subCategories ?? [];
    if (fromTaxonomy.length) return fromTaxonomy;
    return Array.from(new Set(scopedProducts.map((p) => p.subCategory).filter(Boolean) as string[])).map(
      (slug) => ({ slug, name: slug }),
    );
  }, [activeCategory, scopedProducts, CATEGORIES]);

  return (
    <aside className="sticky top-24 flex h-max w-full flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-semibold">
          <Filter className="h-4 w-4 text-brand" /> Filters
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...DEFAULT_FILTERS,
              category: lockedCategory ?? null,
            })
          }
          className="cursor-pointer text-xs font-medium text-brand hover:underline"
        >
          Reset all
        </button>
      </div>

      {!hideCategoryList && (
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h4>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() =>
                  onChange({
                    ...filters,
                    category: filters.category === c.slug ? null : c.slug,
                    subCategory: null,
                  })
                }
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  filters.category === c.slug
                    ? "bg-brand-soft font-semibold text-brand"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.productCount.toLocaleString("en-IN")}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {subCategories.length > 0 && (
        <>
          {!hideCategoryList && <Separator />}
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subcategory</h4>
            <div className="flex flex-wrap gap-1.5">
              {subCategories.map((sc) => {
                const on = filters.subCategory === sc.slug;
                return (
                  <button
                    type="button"
                    key={sc.slug}
                    onClick={() => onChange({ ...filters, subCategory: on ? null : sc.slug })}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                      on
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-card text-foreground hover:border-brand/40"
                    }`}
                  >
                    {sc.name}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      <Separator />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max price</h4>
          <span className="text-sm font-semibold text-brand">₹{filters.priceMax.toLocaleString("en-IN")}</span>
        </div>
        <Slider
          value={[filters.priceMax]}
          min={200}
          max={10000}
          step={100}
          onValueChange={(v) => onChange({ ...filters, priceMax: v[0]! })}
        />
      </section>

      <Separator />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max MOQ</h4>
          <span className="text-sm font-semibold text-brand">{filters.moqMax} units</span>
        </div>
        <Slider
          value={[filters.moqMax]}
          min={1}
          max={100}
          step={1}
          onValueChange={(v) => onChange({ ...filters, moqMax: v[0]! })}
        />
      </section>

      <Separator />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min rating</h4>
          <span className="text-sm font-semibold text-brand">
            {filters.minRating === 0 ? "Any" : `${filters.minRating.toFixed(1)}★`}
          </span>
        </div>
        <Slider
          value={[filters.minRating]}
          min={0}
          max={5}
          step={0.5}
          onValueChange={(v) => onChange({ ...filters, minRating: v[0]! })}
        />
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery time</h4>
        <div className="flex flex-wrap gap-1.5">
          {DELIVERY_OPTIONS.map((opt) => {
            const on = filters.maxDeliveryDays === opt.value;
            return (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => onChange({ ...filters, maxDeliveryDays: opt.value })}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-card text-foreground hover:border-brand/40"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brands</h4>
        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${b}`}
                checked={filters.brands.includes(b)}
                onCheckedChange={() => toggleArr("brands", b)}
              />
              <Label htmlFor={`brand-${b}`} className="cursor-pointer text-sm font-normal">
                {b}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</h4>
        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {SUPPLIERS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Checkbox
                id={`sup-${s.id}`}
                checked={filters.suppliers.includes(s.id)}
                onCheckedChange={() => toggleArr("suppliers", s.id)}
              />
              <Label htmlFor={`sup-${s.id}`} className="cursor-pointer text-sm font-normal">
                {s.name}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</h4>
        <Input
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          placeholder="City or state"
          className="h-9"
        />
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST rate</h4>
        <div className="flex flex-wrap gap-2">
          {GST_RATES.map((r) => {
            const on = filters.gstRates.includes(r);
            return (
              <button
                type="button"
                key={r}
                onClick={() => toggleArr("gstRates", r)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-card text-foreground hover:border-brand/40"
                }`}
              >
                {r}%
              </button>
            );
          })}
        </div>
      </section>

      <Separator />
      <section className="space-y-2">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</h4>
        {[
          { id: "verified", label: "Verified supplier only", key: "verifiedOnly" as const },
          { id: "gst", label: "GST invoice", key: "gstOnly" as const },
          { id: "stock", label: "In stock only", key: "inStockOnly" as const },
        ].map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Checkbox
              id={row.id}
              checked={filters[row.key] as boolean}
              onCheckedChange={(v) => onChange({ ...filters, [row.key]: !!v })}
            />
            <Label htmlFor={row.id} className="cursor-pointer text-sm font-normal">
              {row.label}
            </Label>
          </div>
        ))}
      </section>

      <Button type="button" className="w-full shadow-brand">
        Apply filters
      </Button>
    </aside>
  );
}
