import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Category, Product } from "@/types";
import { useCategories, useFeaturedProducts, useProductsByCategory } from "@/hooks/useCatalog";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { inr } from "@/lib/format";

const SCROLL_HIDE =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function LandingProductCard({ product }: { product: Product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src =
    !product.image || imgFailed
      ? "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=70"
      : product.image;

  return (
    <article className="flex w-[11.5rem] shrink-0 flex-col sm:w-[13rem]">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          resetScroll
          className="block aspect-square p-3"
        >
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-contain"
          />
        </Link>
        {product.inStock && (
          <div className="absolute bottom-2 right-2 z-10">
            <AddToCartControl
              product={product}
              size="sm"
              showLabel
              className="h-8 w-auto flex-none rounded-lg border border-brand bg-card px-2.5 text-xs font-bold uppercase tracking-wide text-brand shadow-none hover:bg-brand-soft hover:text-brand"
            />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5 px-0.5">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          resetScroll
          className="line-clamp-2 text-sm font-bold leading-snug text-foreground"
        >
          {product.name}
          {product.unit ? `, ${product.unit}` : ""}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {product.unit && (
            <span className="rounded-md bg-info-soft px-1.5 py-0.5 text-[11px] font-semibold text-info">
              {product.moq} {product.unit}
            </span>
          )}
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-brand text-brand" />
              <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span>({product.reviewCount >= 1000 ? "1K+" : product.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <div>
          <div className="text-base font-bold text-foreground">{inr(product.wholesalePrice)}</div>
          {product.mrp > product.wholesalePrice && (
            <div className="text-xs text-muted-foreground line-through">
              {inr(product.mrp)}
              {product.unit ? `/${product.unit}` : ""}
            </div>
          )}
          <div className="mt-0.5 text-xs font-semibold text-brand">
            {inr(product.wholesalePrice)}
            {product.unit ? `/${product.unit}` : ""} Best rate
          </div>
        </div>
      </div>
    </article>
  );
}

function CategoryProductCarousel({
  title,
  subtitle,
  image,
  seeAllTo,
  seeAllParams,
  products,
  isLoading,
}: {
  title: string;
  subtitle: string;
  image?: string | null;
  seeAllTo: "/marketplace" | "/categories/$slug";
  seeAllParams?: { slug: string };
  products: Product[];
  isLoading: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!isLoading && products.length === 0) return null;

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.75, 360), behavior: "smooth" });
  };

  return (
    <div className="py-8 first:pt-2 last:pb-2">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary sm:h-14 sm:w-14">
          <CategoryImage
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-bold text-foreground sm:text-xl">
            {title}
          </h3>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="hidden h-9 w-9 place-items-center rounded-full border border-brand bg-card text-brand sm:grid"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="hidden h-9 w-9 place-items-center rounded-full border border-brand bg-card text-brand sm:grid"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link
            to={seeAllTo}
            params={seeAllParams}
            resetScroll
            className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand sm:text-sm"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={`flex gap-4 overflow-x-auto pb-1 ${SCROLL_HIDE}`}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-[11.5rem] shrink-0 rounded-xl sm:w-[13rem]" />
            ))
          : products.map((p) => <LandingProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
}: {
  category: Category;
}) {
  const { data: products = [], isLoading } = useProductsByCategory(category.slug, 12);
  return (
    <CategoryProductCarousel
      title={category.name}
      subtitle={category.description || "Wholesale pricing · verified sellers"}
      image={category.image}
      seeAllTo="/categories/$slug"
      seeAllParams={{ slug: category.slug }}
      products={products}
      isLoading={isLoading}
    />
  );
}

export function FeaturedProducts() {
  const { data: featured = [], isLoading: featuredLoading } = useFeaturedProducts(12);
  const { data: categories = [] } = useCategories();
  const rows = categories.slice(0, 5);

  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container-page">
        <CategoryProductCarousel
          title="Featured wholesale picks"
          subtitle="Hand-picked SKUs from verified sellers"
          image={featured[0]?.image}
          seeAllTo="/marketplace"
          products={featured}
          isLoading={featuredLoading}
        />
        {rows.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </section>
  );
}
