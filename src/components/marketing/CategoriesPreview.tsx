import { Link } from "@tanstack/react-router";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesPreview() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section className="bg-background px-3 py-12 sm:px-5 sm:py-14 lg:px-8">
      <div className="mx-auto w-full max-w-[100rem]">
        <div className="rounded-3xl bg-brand-soft px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-14">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="h-px flex-1 bg-brand/30" aria-hidden />
            <h2 className="shrink-0 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-brand sm:text-base">
              Our Categories
            </h2>
            <span className="h-px flex-1 bg-brand/30" aria-hidden />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 xl:gap-5">
            {isLoading
              ? Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-card/80" />
                ))
              : categories.map((c) => (
                  <Link
                    key={c.id}
                    to="/categories/$slug"
                    params={{ slug: c.slug }}
                    resetScroll
                    className="flex h-full flex-col items-center rounded-2xl bg-card px-4 py-5 sm:px-5 sm:py-6"
                  >
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-secondary sm:h-24 sm:w-24">
                      <CategoryImage
                        src={c.image}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-center font-display text-sm font-bold leading-snug text-foreground sm:text-base">
                      {c.name}
                    </h3>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
