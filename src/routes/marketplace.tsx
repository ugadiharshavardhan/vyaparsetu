import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, X, ArrowRight,
  Sprout, Wheat, Droplets, CookingPot, Cookie,
  Sparkles, User, CupSoda, Home, Candy, Coffee, Package
} from "lucide-react";
import { z } from "zod";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductList } from "@/components/product/ProductListItem";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { DEFAULT_FILTERS, FilterSidebar, type Filters } from "@/components/marketplace/FilterSidebar";
import { SortDropdown, type SortKey } from "@/components/marketplace/SortDropdown";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { ViewToggle, type ViewMode } from "@/components/marketplace/ViewToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { filterProducts, sortProducts } from "@/lib/productFilters";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { MarketplacePending } from "@/components/common/LoadingSpinner";

import { getCategoryTheme } from "@/lib/categoryIconMap";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
});

export const Route = createFileRoute("/marketplace")({
  validateSearch: searchSchema,
  pendingComponent: MarketplacePending,
  head: () => ({
    meta: [
      { title: "Marketplace — VyaparSetu" },
      { name: "description", content: "Browse wholesale SKUs from verified Indian suppliers. Filter by category, brand, price and MOQ." },
    ],
  }),
  component: MarketplacePage,
});

const PAGE_SIZE = 12;

function ShopByCategorySection() {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-28 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 bg-card border border-border/60 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl text-foreground">
            Shop by Category
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Business-grade staples and essentials at scale
          </p>
        </div>
        <Button variant="link" asChild className="text-brand hover:text-brand-dark font-bold text-xs cursor-pointer p-0">
          <Link to="/categories">
            View All Categories
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.slug);
          const Icon = theme.icon;
          return (
            <Link
              key={cat.id}
              to="/categories/$slug"
              params={{ slug: cat.slug }}
              className={`group flex w-[110px] sm:w-[124px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-muted/30 ${theme.borderColor}`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme.bgColor}`}>
                <Icon className={`h-8 w-8 ${theme.iconColor} stroke-[2]`} />
              </div>
              <span className="mt-3 text-center text-[11px] font-bold leading-tight text-foreground group-hover:text-brand sm:text-xs">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PromotionalBanners() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {/* Banner 1: Sell First, Pay Later */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white dark:from-muted/20 dark:to-background p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px] md:min-h-[240px] group">
        <div className="absolute right-0 bottom-0 h-40 w-40 md:h-44 md:w-44 opacity-85 pointer-events-none transition-transform duration-500 group-hover:scale-105">
          <img
            src="/sell_first_pay_later.png"
            alt="Sell First Pay Later Illustration"
            className="h-full w-full object-contain object-bottom-right"
          />
        </div>
        <div className="relative z-10 max-w-[62%] flex flex-col h-full justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              Deferred Payment Credit
            </span>
            <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight">
              Sell First, Pay Later
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Available for the <strong>first 10 eligible orders</strong>. Stock your shelves today and complete payment only after your inventory is fully sold!
            </p>
          </div>
          <div>
            <Button size="sm" className="rounded-full bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-5 shadow-sm cursor-pointer">
              Apply for Credit
            </Button>
          </div>
        </div>
      </div>

      {/* Banner 2: First Bulk Order Offer */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white dark:from-muted/20 dark:to-background p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px] md:min-h-[240px] group">
        <div className="absolute right-0 bottom-0 h-40 w-40 md:h-44 md:w-44 opacity-85 pointer-events-none transition-transform duration-500 group-hover:scale-105">
          <img
            src="/first_bulk_order.png"
            alt="First Bulk Order Illustration"
            className="h-full w-full object-contain object-bottom-right"
          />
        </div>
        <div className="relative z-10 max-w-[62%] flex flex-col h-full justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              Bulk Order Promotion
            </span>
            <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight">
              First Bulk Order Deal
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get <strong>50% payment on delivery</strong> for your first eligible bulk wholesale purchase. Secure transport with door-step tracking.
            </p>
          </div>
          <div>
            <Button size="sm" className="rounded-full bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-5 shadow-sm cursor-pointer">
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplacePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/marketplace" });
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [query, setQuery] = useState(search.q ?? "");
  const debouncedQuery = useDebounce(query, 200);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: search.category ?? null,
    suppliers: search.supplier ? [search.supplier] : [],
  });
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loading = productsLoading || categoriesLoading;

  const isDefaultView = !debouncedQuery && !filters.category && filters.suppliers.length === 0;

  const categoryShelves = useMemo(() => {
    if (!isDefaultView) return null;
    const shelves: Record<string, { categoryName: string; categorySlug: string; products: Product[] }> = {};
    for (const p of products) {
      if (!p.category) continue;
      if (!shelves[p.category]) {
        const catObj = categories.find((c) => c.slug === p.category);
        shelves[p.category] = {
          categoryName: catObj?.name ?? p.category,
          categorySlug: p.category,
          products: [],
        };
      }
      shelves[p.category].products.push(p);
    }
    return Object.values(shelves)
      .filter((s) => s.products.length > 0)
      .map((shelf) => ({
        ...shelf,
        products: [...shelf.products].sort(() => 0.5 - Math.random()),
      }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [products, categories, isDefaultView]);

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    void navigate({
      search: (prev) => ({ ...prev, q: debouncedQuery || undefined }),
      replace: true,
    });
  }, [debouncedQuery, navigate]);

  useEffect(() => {
    const next = search.category ?? null;
    setFilters((prev) =>
      prev.category === next ? prev : { ...prev, category: next, subCategory: null },
    );
  }, [search.category]);

  useEffect(() => { setPage(1); }, [debouncedQuery, filters, sort]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === filters.category) ?? null,
    [categories, filters.category],
  );

  const filtered = useMemo(() => {
    return sortProducts(filterProducts(products, filters, debouncedQuery), sort);
  }, [products, debouncedQuery, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    if (next.category !== filters.category) {
      void navigate({
        search: (prev) => ({
          ...prev,
          category: next.category ?? undefined,
        }),
        replace: true,
      });
    }
  };

  return (
    <div className="pb-12">
      <div className="container-page py-6 md:py-8">
        {isDefaultView ? (
          <div className="space-y-10">
            <ShopByCategorySection />

            <PromotionalBanners />

            <div className="space-y-10">
              {categoryShelves?.map((shelf) => (
                <section key={shelf.categorySlug} className="space-y-5 bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-soft transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl text-foreground">
                        {shelf.categoryName}
                      </h2>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-brand hover:text-brand hover:bg-brand-soft/10 font-bold gap-1 cursor-pointer">
                      <Link to="/categories/$slug" params={{ slug: shelf.categorySlug }}>
                        View All <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <ProductGrid products={shelf.products.slice(0, 5)} onQuickView={setQuick} />
                </section>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10 flex flex-col gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {selectedCategory ? selectedCategory.name : "Search results"}
              </h1>
              <p className="text-muted-foreground">
                {selectedCategory
                  ? `${filtered.length.toLocaleString("en-IN")} products in ${selectedCategory.name}`
                  : `${filtered.length.toLocaleString("en-IN")} wholesale products matching your search.`}
              </p>
            </div>

            <div className="mt-6 flex justify-end items-center gap-2">
              <ViewToggle value={view} onChange={setView} />
              <SortDropdown value={sort} onChange={setSort} />
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                className={showFilters ? "shadow-brand cursor-pointer" : "cursor-pointer"}
                onClick={() => setShowFilters((v) => !v)}
              >
                {showFilters ? <X className="mr-1.5 h-4 w-4" /> : <SlidersHorizontal className="mr-1.5 h-4 w-4" />}
                {showFilters ? "Hide filters" : "Filters"}
              </Button>
            </div>

            <div className={`mt-8 grid gap-8 ${showFilters ? "lg:grid-cols-[280px_1fr]" : ""}`}>
              {showFilters && (
                <div className="min-w-0">
                  <FilterSidebar
                    filters={filters}
                    onChange={handleFiltersChange}
                    products={products}
                    categories={categories}
                  />
                </div>
              )}
              <div className="min-w-0">
                {loading ? (
                  <ProductGridSkeleton />
                ) : paginated.length === 0 ? (
                  <EmptyState
                    onReset={() => {
                      setFilters(DEFAULT_FILTERS);
                      void navigate({ search: {}, replace: true });
                    }}
                  />
                ) : (
                  <>
                    {view === "grid" ? (
                      <ProductGrid products={paginated} onQuickView={setQuick} />
                    ) : (
                      <ProductList products={paginated} onQuickView={setQuick} />
                    )}
                    {totalPages > 1 && (
                      <Pagination className="mt-10">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={page === i + 1}
                                onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </div>
  );
}
