import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useCategories, useProducts } from "@/hooks/useCatalog";

export function CategoryChips({
  value,
  onChange,
  navigateOnSelect = false,
}: {
  value: string | null;
  onChange?: (v: string | null) => void;
  /** When true, chip click opens the dedicated category page. */
  navigateOnSelect?: boolean;
}) {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  const countsBySlug = useMemo(() => {
    return categories.reduce<Record<string, number>>((acc, c) => {
      acc[c.slug] = products.filter((p) => p.category === c.slug).length;
      return acc;
    }, {});
  }, [categories, products]);

  const select = (slug: string | null) => {
    if (navigateOnSelect && slug) {
      void navigate({ to: "/categories/$slug", params: { slug } });
      return;
    }
    if (navigateOnSelect && !slug) {
      void navigate({ to: "/marketplace", search: {} });
      return;
    }
    onChange?.(slug);
  };

  return (
    <section aria-label="Browse by category" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tap a category to browse wholesale products by business vertical.
          </p>
        </div>
        {value && !navigateOnSelect && (
          <button
            type="button"
            onClick={() => select(null)}
            className="cursor-pointer text-xs font-semibold text-brand hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        <Chip active={!value} onClick={() => select(null)} count={products.length}>
          All
        </Chip>
        {categories.map((c) => {
          const Icon =
            (Icons[c.icon as keyof typeof Icons] as typeof Icons.ShoppingBasket) ?? Icons.Package;
          const count = countsBySlug[c.slug] ?? 0;
          return (
            <Chip
              key={c.id}
              active={value === c.slug}
              onClick={() => select(c.slug)}
              count={count}
              icon={<Icon className="h-3.5 w-3.5 shrink-0" />}
            >
              {c.name}
            </Chip>
          );
        })}
      </div>
    </section>
  );
}

function Chip({
  children,
  active,
  onClick,
  count,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-brand bg-brand text-white shadow-brand"
          : "border-border bg-card text-foreground hover:border-brand/40 hover:bg-brand-soft/40"
      }`}
    >
      {icon}
      <span>{children}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-secondary"}`}>
        {count}
      </span>
    </button>
  );
}
