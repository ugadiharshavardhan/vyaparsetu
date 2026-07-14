import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CategoryTile } from "@/components/marketplace/CategoryCard";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryGrid({
  title = "Browse by category",
  description = "Wholesale business categories for bulk purchasing — tap a category to explore products.",
  limit,
  showViewAll = true,
}: {
  title?: string;
  description?: string;
  limit?: number;
  showViewAll?: boolean;
}) {
  const { data: categories = [], isLoading } = useCategories();
  const list = typeof limit === "number" ? categories.slice(0, limit) : categories;
  const cols = Math.max(list.length, 1);

  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-8 w-64" />
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-40 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {showViewAll && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link to="/categories">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {/* One row on desktop; horizontal scroll on smaller screens */}
      <div
        className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin] xl:grid xl:overflow-visible xl:pb-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {list.map((c, i) => (
          <CategoryTile key={c.id} category={c} index={i} />
        ))}
      </div>
    </section>
  );
}
