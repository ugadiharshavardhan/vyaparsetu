import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/types";
import { PRODUCTS } from "@/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import {
  DEFAULT_FILTERS,
  FilterSidebar,
  type Filters,
} from "@/components/marketplace/FilterSidebar";
import { SortDropdown, type SortKey } from "@/components/marketplace/SortDropdown";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/marketplace")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Marketplace — VyaparSetu" },
      {
        name: "description",
        content:
          "Browse 2.5L+ wholesale SKUs from verified Indian suppliers. Filter by category, brand, price and MOQ.",
      },
    ],
  }),
  component: MarketplacePage,
});

const PAGE_SIZE = 12;

function MarketplacePage() {
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.q ?? "");
  const debouncedQuery = useDebounce(query, 200);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: search.category ?? null,
  });
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters, sort]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (p.wholesalePrice > filters.priceMax) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.verifiedOnly && !p.supplier.verified) return false;
      if (filters.gstOnly && !p.gstIncluded) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.wholesalePrice - b.wholesalePrice);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.wholesalePrice - a.wholesalePrice);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list = [...list].reverse();
        break;
      default:
        list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [debouncedQuery, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Marketplace</h1>
        <p className="text-muted-foreground">
          {filtered.length.toLocaleString("en-IN")} wholesale products from verified Indian suppliers.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories…"
            className="h-11 rounded-full border-border bg-card pl-10 shadow-soft"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortDropdown value={sort} onChange={setSort} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90%] max-w-sm overflow-y-auto p-4">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-4">
        <CategoryChips
          value={filters.category}
          onChange={(v) => setFilters({ ...filters, category: v })}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>
        <div>
          {loading ? (
            <ProductGridSkeleton />
          ) : paginated.length === 0 ? (
            <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <>
              <ProductGrid products={paginated} onQuickView={setQuick} />
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
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </div>
  );
}
