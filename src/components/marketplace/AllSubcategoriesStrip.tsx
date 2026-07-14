import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { Category, SubCategory } from "@/types";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

export type SubCategoryRef = SubCategory & { categorySlug: string; categoryName: string };

/** Flatten every subcategory across all main categories. */
export function flattenSubCategories(categories: Category[]): SubCategoryRef[] {
  return categories.flatMap((c) =>
    (c.subCategories ?? []).map((sc) => ({
      ...sc,
      categorySlug: c.slug,
      categoryName: c.name,
    })),
  );
}

/** Marketplace "All" strip — shows every subcategory (not main categories). */
export function AllSubcategoriesStrip({
  title = "Shop by subcategory",
  description = "Browse every wholesale subcategory. Tap one to see its products.",
}: {
  title?: string;
  description?: string;
}) {
  const { data: categories = [], isLoading } = useCategories();
  const items = useMemo(() => flattenSubCategories(categories), [categories]);

  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-8 w-64" />
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-24 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section>
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((sc) => (
          <Link
            key={`${sc.categorySlug}:${sc.slug}`}
            to="/categories/$slug"
            params={{ slug: sc.categorySlug }}
            search={{ sub: sc.slug }}
            className="group flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-2 sm:w-[112px]"
          >
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary transition-all group-hover:border-brand/40 group-hover:shadow-soft">
              <CategoryImage
                src={sc.image}
                alt={sc.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="line-clamp-2 text-center text-[11px] font-semibold leading-snug text-foreground group-hover:text-brand sm:text-xs">
              {sc.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
