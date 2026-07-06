import { Filter } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/data/categories";
import { SUPPLIERS } from "@/data/suppliers";
import { PRODUCTS } from "@/data/products";
import { Button } from "@/components/ui/button";

export type Filters = {
  category: string | null;
  subCategory: string | null;
  priceMax: number;
  moqMax: number;
  minRating: number;
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
  location: "",
  brands: [],
  suppliers: [],
  gstRates: [],
  verifiedOnly: false,
  gstOnly: false,
  inStockOnly: true,
};

const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();
const GST_RATES = [5, 12, 18];

export function FilterSidebar({
  filters, onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const toggleArr = <K extends keyof Filters>(key: K, value: Filters[K] extends Array<infer U> ? U : never) => {
    const arr = filters[key] as unknown as unknown[];
    const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
    onChange({ ...filters, [key]: next } as Filters);
  };

  const subCategories = useMemo(() => {
    if (!filters.category) return [];
    return Array.from(
      new Set(
        PRODUCTS.filter((p) => p.category === filters.category)
          .map((p) => p.subCategory)
          .filter(Boolean) as string[],
      ),
    ).sort();
  }, [filters.category]);

  return (
    <aside className="sticky top-24 flex h-max w-full flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-semibold">
          <Filter className="h-4 w-4 text-brand" /> Filters
        </div>
        <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs font-medium text-brand hover:underline">
          Reset all
        </button>
      </div>

      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h4>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({
                ...filters,
                category: filters.category === c.slug ? null : c.slug,
                subCategory: null,
              })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filters.category === c.slug ? "bg-brand-soft font-semibold text-brand" : "text-foreground hover:bg-secondary"
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.productCount.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>
      </section>

      {subCategories.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sub-category</h4>
            <div className="flex flex-wrap gap-1.5">
              {subCategories.map((sc) => {
                const on = filters.subCategory === sc;
                return (
                  <button
                    key={sc}
                    onClick={() => onChange({ ...filters, subCategory: on ? null : sc })}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                      on ? "border-brand bg-brand text-white" : "border-border bg-card text-foreground hover:border-brand/40"
                    }`}
                  >
                    {sc}
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
        <Slider value={[filters.priceMax]} min={200} max={10000} step={100} onValueChange={(v) => onChange({ ...filters, priceMax: v[0]! })} />
      </section>

      <Separator />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max MOQ</h4>
          <span className="text-sm font-semibold text-brand">{filters.moqMax} units</span>
        </div>
        <Slider value={[filters.moqMax]} min={1} max={100} step={1} onValueChange={(v) => onChange({ ...filters, moqMax: v[0]! })} />
      </section>

      <Separator />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min rating</h4>
          <span className="text-sm font-semibold text-brand">{filters.minRating === 0 ? "Any" : `${filters.minRating.toFixed(1)}★`}</span>
        </div>
        <Slider value={[filters.minRating]} min={0} max={5} step={0.5} onValueChange={(v) => onChange({ ...filters, minRating: v[0]! })} />
      </section>

      <Separator />
      <section>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brands</h4>
        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {BRANDS.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Checkbox id={`brand-${b}`} checked={filters.brands.includes(b)} onCheckedChange={() => toggleArr("brands", b)} />
              <Label htmlFor={`brand-${b}`} className="text-sm font-normal">{b}</Label>
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
              <Checkbox id={`sup-${s.id}`} checked={filters.suppliers.includes(s.id)} onCheckedChange={() => toggleArr("suppliers", s.id)} />
              <Label htmlFor={`sup-${s.id}`} className="text-sm font-normal">{s.name}</Label>
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
        <div className="flex gap-2">
          {GST_RATES.map((r) => {
            const on = filters.gstRates.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleArr("gstRates", r)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  on ? "border-brand bg-brand text-white" : "border-border bg-card text-foreground hover:border-brand/40"
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
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h4>
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
            <Label htmlFor={row.id} className="text-sm font-normal">{row.label}</Label>
          </div>
        ))}
      </section>

      <Button className="w-full shadow-brand">Apply filters</Button>
    </aside>
  );
}
