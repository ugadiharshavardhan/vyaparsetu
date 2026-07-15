import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductList } from "@/components/product/ProductListItem";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { DEFAULT_FILTERS, FilterSidebar, type Filters } from "@/components/marketplace/FilterSidebar";
import { SortDropdown, type SortKey } from "@/components/marketplace/SortDropdown";
import { CategoryNavBar } from "@/components/marketplace/CategoryNavBar";
import { AllSubcategoriesStrip } from "@/components/marketplace/AllSubcategoriesStrip";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { ViewToggle, type ViewMode } from "@/components/marketplace/ViewToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { filterProducts, sortProducts } from "@/lib/productFilters";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { MarketplacePending } from "@/components/common/LoadingSpinner";

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
      <CategoryNavBar activeSlug={null} />

      <div className="container-page py-6 md:py-8">
        <AllSubcategoriesStrip
          title="Shop by wholesale subcategory"
          description="Every subcategory across Food, Healthcare, Electronics and more — tap one to browse its products."
        />

      <div className="mt-10 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {selectedCategory ? selectedCategory.name : "All products"}
        </h1>
        <p className="text-muted-foreground">
          {selectedCategory
            ? `${filtered.length.toLocaleString("en-IN")} products in ${selectedCategory.name}`
            : `${filtered.length.toLocaleString("en-IN")} wholesale products from verified Indian suppliers.`}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedCategory
                ? `Search in ${selectedCategory.name}…`
                : "Search products, brands, suppliers…"
            }
            className="h-11 rounded-full border-border bg-card pl-10 shadow-soft"
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <SortDropdown value={sort} onChange={setSort} />
          <Button
            type="button"
            variant={showFilters ? "default" : "outline"}
            className={showFilters ? "shadow-brand" : undefined}
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? <X className="mr-1.5 h-4 w-4" /> : <SlidersHorizontal className="mr-1.5 h-4 w-4" />}
            {showFilters ? "Hide filters" : "Filters"}
          </Button>
        </div>
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
      </div>
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </div>
  );
}
