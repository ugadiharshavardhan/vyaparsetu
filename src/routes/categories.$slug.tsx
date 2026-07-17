import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Package, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDbCategory, type DbCategory } from "@/lib/catalogMap";
import { getSubCategoryName, useProductsByCategory } from "@/hooks/useCatalog";
import { MarketplacePending } from "@/components/common/LoadingSpinner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductList } from "@/components/product/ProductListItem";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import {
  DEFAULT_FILTERS,
  FilterSidebar,
  type Filters,
} from "@/components/marketplace/FilterSidebar";
import { SortDropdown, type SortKey } from "@/components/marketplace/SortDropdown";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useSubcategoryImages } from "@/components/marketplace/AllSubcategoriesStrip";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { ViewToggle, type ViewMode } from "@/components/marketplace/ViewToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useBrowseScrollRestore } from "@/hooks/useBrowseScrollRestore";
import { filterProducts, sortProducts } from "@/lib/productFilters";

const searchSchema = z.object({
  q: z.string().optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/categories/$slug")({
  pendingComponent: MarketplacePending,
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const slug = params.slug?.trim();
    if (!slug) throw notFound();
    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, slug, name, icon, image, product_count, description, subcategories(id, slug, name, image, sort_order)",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { category: mapDbCategory(data as unknown as DbCategory) };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.category.name} — VyaparSetu Marketplace`
          : "Category — VyaparSetu",
      },
      {
        name: "description",
        content: loaderData?.category.description ?? "Wholesale category on VyaparSetu",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Category not found</h1>
      <p className="mt-2 text-muted-foreground">This wholesale category may have been moved.</p>
      <Button asChild className="mt-6">
        <Link to="/categories">Browse all categories</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn&apos;t load this category</h1>
      <p className="mt-2 text-muted-foreground">
        Something interrupted the request. Please try again.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button asChild variant="outline">
          <Link to="/categories">Browse all categories</Link>
        </Button>
      </div>
    </div>
  ),
  component: CategoryPage,
});

const PAGE_SIZE = 12;

function CategoryPage() {
  const { category } = Route.useLoaderData();
  useBrowseScrollRestore();
  const { data: subImages = {} } = useSubcategoryImages();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/categories/$slug" });
  const { data: allProducts = [], isLoading: productsLoading } = useProductsByCategory(
    category.slug,
    200,
  );
  const [query, setQuery] = useState(search.q ?? "");
  const debouncedQuery = useDebounce(query, 200);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: category.slug,
    subCategory: search.sub ?? null,
  });
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: category.slug,
      subCategory: search.sub ?? null,
    }));
    setQuery(search.q ?? "");
    setPage(1);
  }, [category.slug, search.sub, search.q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters, sort]);

  useEffect(() => {
    const nextQ = debouncedQuery.trim() || undefined;
    // Only sync when the query actually diverges from the URL. `useNavigate({ from })`
    // returns a new identity on every location change, so without this guard the effect
    // re-fires during unrelated transitions (e.g. a guest clicking "Add" → /auth) and
    // rebuilds "/categories/$slug" with an undefined slug, clobbering that navigation.
    if (nextQ === search.q) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        q: nextQ,
      }),
      replace: true,
    });
  }, [debouncedQuery, search.q, navigate]);

  // Already scoped by category from the server query
  const categoryProducts = allProducts;

  const filtered = useMemo(() => {
    const list = filterProducts(
      categoryProducts,
      { ...filters, category: category.slug },
      debouncedQuery,
    );
    return sortProducts(list, sort);
  }, [categoryProducts, filters, category.slug, debouncedQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const subName = filters.subCategory
    ? getSubCategoryName([category], category.slug, filters.subCategory)
    : null;
  const loading = productsLoading;

  const handleFiltersChange = (next: Filters) => {
    setFilters({ ...next, category: category.slug });
    if (next.subCategory !== filters.subCategory) {
      void navigate({
        search: (prev) => ({
          ...prev,
          sub: next.subCategory ?? undefined,
        }),
        replace: true,
      });
    }
  };

  return (
    <div className="pb-12 bg-background/50">
      <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] w-full">
        {/* Left: Vertical Subcategory Navigation */}
        <aside className="w-[84px] sm:w-[240px] border-r border-border bg-card shrink-0 sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-y-auto py-4 px-2 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Item for All */}
          <Link
            to="/categories/$slug"
            params={{ slug: category.slug }}
            search={{}}
            className={`flex flex-col sm:flex-row items-center gap-2 rounded-xl p-2 sm:p-2.5 transition-all text-center sm:text-left ${
              !filters.subCategory
                ? "bg-brand-soft/20 text-brand font-bold border-l-[3px] sm:border-l-4 border-brand"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            }`}
          >
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft/15 text-brand">
              <Package className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <span className="text-[9px] sm:text-xs font-semibold sm:font-medium leading-tight line-clamp-2">
              All Products
            </span>
          </Link>

          {/* Subcategory items */}
          {category.subCategories.map((sc) => {
            const scImage = subImages[sc.id] || sc.image;
            const isActive = filters.subCategory === sc.slug;
            return (
              <Link
                key={sc.slug}
                to="/categories/$slug"
                params={{ slug: category.slug }}
                search={{ sub: sc.slug }}
                className={`flex flex-col sm:flex-row items-center gap-2 rounded-xl p-2 sm:p-2.5 transition-all text-center sm:text-left ${
                  isActive
                    ? "bg-brand-soft/20 text-brand font-bold border-l-[3px] sm:border-l-4 border-brand"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <div className="relative h-9 w-9 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  <CategoryImage
                    src={scImage}
                    alt={sc.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold sm:font-medium leading-tight line-clamp-2">
                  {sc.name}
                </span>
              </Link>
            );
          })}
        </aside>

        {/* Right: Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb Path */}
          <nav className="text-[10px] sm:text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
            <Link to="/marketplace" className="hover:text-brand transition-colors">
              Marketplace
            </Link>
            <span>&gt;</span>
            <span className="text-foreground font-medium">{category.name}</span>
            {subName && (
              <>
                <span>&gt;</span>
                <span className="text-brand font-semibold">{subName}</span>
              </>
            )}
          </nav>

          {/* Title Header */}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              {subName ? subName : category.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {filtered.length.toLocaleString("en-IN")} wholesale products available at scale
            </p>
          </div>

          {/* Top Filters & Search Row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-border pb-5">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filters.inStockOnly ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-xs h-8.5 px-3.5 cursor-pointer ${
                  filters.inStockOnly
                    ? "shadow-brand bg-brand text-white border-brand hover:bg-brand-dark"
                    : "hover:border-brand/40"
                }`}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))
                }
              >
                In Stock
              </Button>
              <Button
                variant={filters.gstOnly ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-xs h-8.5 px-3.5 cursor-pointer ${
                  filters.gstOnly
                    ? "shadow-brand bg-brand text-white border-brand hover:bg-brand-dark"
                    : "hover:border-brand/40"
                }`}
                onClick={() => setFilters((prev) => ({ ...prev, gstOnly: !prev.gstOnly }))}
              >
                GST Included
              </Button>
              <SortDropdown value={sort} onChange={setSort} />
              <ViewToggle value={view} onChange={setView} />
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-xs h-8.5 px-3.5 ${showFilters ? "shadow-brand bg-brand text-white border-brand" : "hover:border-brand/40"}`}
                onClick={() => setShowFilters((v) => !v)}
              >
                {showFilters ? (
                  <X className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                )}
                {showFilters ? "Hide filters" : "More Filters"}
              </Button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search in ${subName ?? category.name}…`}
                className="h-9 rounded-full border-border bg-card pl-9 text-xs shadow-soft"
              />
            </div>
          </div>

          {/* Grid Content with optional sidebar */}
          <div className={`grid gap-8 ${showFilters ? "lg:grid-cols-[280px_1fr]" : ""}`}>
            {showFilters && (
              <div className="min-w-0">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFiltersChange}
                  hideCategoryList
                  lockedCategory={category.slug}
                />
              </div>
            )}
            <div className="min-w-0">
              {loading ? (
                <ProductGridSkeleton />
              ) : paginated.length === 0 ? (
                <EmptyState
                  onReset={() => {
                    setFilters({ ...DEFAULT_FILTERS, category: category.slug });
                    setQuery("");
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
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((p) => Math.max(1, p - 1));
                            }}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((p) => Math.min(totalPages, p + 1));
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </div>
  );
}
