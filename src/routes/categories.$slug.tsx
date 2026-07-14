import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDbCategory, type DbCategory } from "@/lib/catalogMap";
import { getByCategory, getSubCategoryName, useProducts } from "@/hooks/useCatalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductList } from "@/components/product/ProductListItem";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { DEFAULT_FILTERS, FilterSidebar, type Filters } from "@/components/marketplace/FilterSidebar";
import { SortDropdown, type SortKey } from "@/components/marketplace/SortDropdown";
import { CategoryNavBar } from "@/components/marketplace/CategoryNavBar";
import { SubcategoryStrip } from "@/components/marketplace/SubcategoryStrip";
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
import { filterProducts, sortProducts } from "@/lib/productFilters";

const searchSchema = z.object({
  q: z.string().optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
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
  component: CategoryPage,
});

const PAGE_SIZE = 12;

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/categories/$slug" });
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
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
    void navigate({
      search: (prev) => ({
        ...prev,
        q: debouncedQuery.trim() || undefined,
      }),
      replace: true,
    });
  }, [debouncedQuery, navigate]);

  const categoryProducts = useMemo(
    () => getByCategory(allProducts, category.slug),
    [allProducts, category.slug],
  );

  const filtered = useMemo(() => {
    const list = filterProducts(categoryProducts, { ...filters, category: category.slug }, debouncedQuery);
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
    <div className="pb-12">
      <CategoryNavBar activeSlug={category.slug} />

      <div className="container-page mt-5 space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {subName ?? category.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length.toLocaleString("en-IN")} products
            {subName ? ` in ${subName}` : ` in ${category.name}`}
          </p>
        </div>

        <SubcategoryStrip
          categorySlug={category.slug}
          items={category.subCategories}
          activeSub={filters.subCategory}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${subName ?? category.name}…`}
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
      </div>
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </div>
  );
}
