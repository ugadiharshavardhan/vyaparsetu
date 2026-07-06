import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/button";

export type Filters = {
  category: string | null;
  priceMax: number;
  brands: string[];
  verifiedOnly: boolean;
  gstOnly: boolean;
  inStockOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  category: null,
  priceMax: 10000,
  brands: [],
  verifiedOnly: false,
  gstOnly: false,
  inStockOnly: true,
};

const BRANDS = ["Aashirvaad", "Fortune", "Parle", "Britannia", "Tata", "Amul", "Surf Excel", "Godrej"];

export function FilterSidebar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const toggleBrand = (b: string) => {
    const next = filters.brands.includes(b)
      ? filters.brands.filter((x) => x !== b)
      : [...filters.brands, b];
    onChange({ ...filters, brands: next });
  };

  return (
    <aside className="sticky top-24 flex h-max w-full flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-semibold">
          <Filter className="h-4 w-4 text-brand" /> Filters
        </div>
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-xs font-medium text-brand hover:underline"
        >
          Reset
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h4>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ ...filters, category: filters.category === c.slug ? null : c.slug })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filters.category === c.slug
                  ? "bg-brand-soft font-semibold text-brand"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {c.name}
              <span className="text-xs text-muted-foreground">{c.productCount.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
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
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brands</h4>
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${b}`}
                checked={filters.brands.includes(b)}
                onCheckedChange={() => toggleBrand(b)}
              />
              <Label htmlFor={`brand-${b}`} className="text-sm font-normal">{b}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="verified"
            checked={filters.verifiedOnly}
            onCheckedChange={(v) => onChange({ ...filters, verifiedOnly: !!v })}
          />
          <Label htmlFor="verified" className="text-sm font-normal">Verified only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="gst"
            checked={filters.gstOnly}
            onCheckedChange={(v) => onChange({ ...filters, gstOnly: !!v })}
          />
          <Label htmlFor="gst" className="text-sm font-normal">GST invoice</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="stock"
            checked={filters.inStockOnly}
            onCheckedChange={(v) => onChange({ ...filters, inStockOnly: !!v })}
          />
          <Label htmlFor="stock" className="text-sm font-normal">In stock</Label>
        </div>
      </div>

      <Button className="w-full shadow-brand">Apply filters</Button>
    </aside>
  );
}
