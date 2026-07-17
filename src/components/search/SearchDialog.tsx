import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Loader2, Search as SearchIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import {
  resolveSearchTarget,
  searchCatalogBrands,
  searchCatalogCategories,
  searchCatalogProducts,
  type SearchNavTarget,
} from "@/lib/searchNavigation";
import { cn } from "@/lib/utils";

const RECENT_KEY = "vs.recent-searches";

const searchResultItemClass =
  "!bg-transparent data-[selected=true]:!bg-transparent data-[selected=true]:!text-foreground aria-selected:!bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const { data: products = [], isFetching: productsFetching } = useProducts({ enabled: open });
  const { data: categories = [] } = useCategories({ enabled: open });

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    if (!hasQuery) {
      return { products: [], brands: [], categories: [] };
    }
    return {
      products: searchCatalogProducts(products, trimmedQuery),
      brands: searchCatalogBrands(products, trimmedQuery),
      categories: searchCatalogCategories(categories, trimmedQuery),
    };
  }, [hasQuery, trimmedQuery, products, categories]);

  const hasResults =
    results.products.length > 0 || results.brands.length > 0 || results.categories.length > 0;

  const pushRecent = (term: string) => {
    const label = term.trim();
    if (!label) return;
    const next = [label, ...recent.filter((t) => t !== label)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const followTarget = (target: SearchNavTarget, label: string) => {
    pushRecent(label);
    onOpenChange(false);
    if (target.type === "product") {
      void navigate({ to: "/products/$slug", params: { slug: target.slug } });
      return;
    }
    if (target.type === "category") {
      void navigate({ to: "/categories/$slug", params: { slug: target.slug } });
      return;
    }
    void navigate({ to: "/marketplace", search: { q: target.q } });
  };

  const goToSearchTerm = (term: string) => {
    followTarget(resolveSearchTarget(term, products, categories), term);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      className="[&_[cmdk-item][data-selected=true]]:!bg-transparent [&_[cmdk-item][data-selected=true]]:!text-foreground [&_[cmdk-item]:hover]:!bg-transparent"
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search products, brands, categories…"
      />
      <CommandList>
        {hasQuery ? (
          <>
            {!hasResults && (
              <CommandEmpty>
                {productsFetching ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" /> Searching…
                  </span>
                ) : (
                  "No results. Try a different keyword."
                )}
              </CommandEmpty>
            )}

            {results.categories.length > 0 && (
              <CommandGroup heading="Categories">
                {results.categories.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`category-${c.id}-${c.slug}`}
                    className={searchResultItemClass}
                    onSelect={() => followTarget({ type: "category", slug: c.slug }, c.name)}
                  >
                    <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.brands.length > 0 && (
              <CommandGroup heading="Brands">
                {results.brands.map((b) => (
                  <CommandItem
                    key={b}
                    value={`brand-${b}`}
                    className={searchResultItemClass}
                    onSelect={() => followTarget({ type: "marketplace", q: b }, b)}
                  >
                    <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {b}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.products.length > 0 && (
              <CommandGroup heading="Products">
                {results.products.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`product-${p.id}-${p.slug}`}
                    className={cn(searchResultItemClass, "gap-3")}
                    onSelect={() => followTarget({ type: "product", slug: p.slug }, p.name)}
                  >
                    <img src={p.image} alt="" className="h-9 w-9 rounded-md object-cover" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {p.brand} · {p.supplier.name}
                      </span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasResults && (
              <CommandGroup heading="Search all">
                <CommandItem
                  value={`search-all-${trimmedQuery}`}
                  className={searchResultItemClass}
                  onSelect={() => goToSearchTerm(trimmedQuery)}
                >
                  <SearchIcon className="mr-2 h-4 w-4 text-brand" />
                  View all results for &ldquo;{trimmedQuery}&rdquo;
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CommandItem>
              </CommandGroup>
            )}
          </>
        ) : (
          <>
            {recent.length > 0 && (
              <>
                <CommandGroup heading="Recent searches">
                  {recent.map((r) => (
                    <CommandItem
                      key={r}
                      value={`recent-${r}`}
                      className={searchResultItemClass}
                      onSelect={() => goToSearchTerm(r)}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {r}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading="Browse categories">
              {categories.slice(0, 6).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`browse-cat-${c.id}`}
                  className={searchResultItemClass}
                  onSelect={() => followTarget({ type: "category", slug: c.slug }, c.name)}
                >
                  <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
