import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Loader2, Search as SearchIcon, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { TRENDING_SEARCHES } from "@/constants/site";
import { useCategories, useProducts } from "@/hooks/useCatalog";

const RECENT_KEY = "vs.recent-searches";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
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
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], brands: [], categories: [] };
    
    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.supplier.name.toLowerCase().includes(q),
    );

    // Extract unique brands from matched products
    const brands = Array.from(new Set(matchedProducts.map(p => p.brand))).slice(0, 3);
    
    // Match categories
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);

    return {
      products: matchedProducts.slice(0, 5),
      brands,
      categories: matchedCategories
    };
  }, [query, products, categories]);

  const pushRecent = (term: string) => {
    const next = [term, ...recent.filter((t) => t !== term)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const goToMarketplace = (term: string) => {
    pushRecent(term);
    onOpenChange(false);
    navigate({ to: "/marketplace", search: { q: term } as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search products, brands, categories…"
      />
      <CommandList>
        <CommandEmpty>
          {productsFetching ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand" /> Searching…
            </span>
          ) : (
            "No results. Try a different keyword."
          )}
        </CommandEmpty>

        {query && (results.products.length > 0 || results.brands.length > 0 || results.categories.length > 0) && (
          <>
            {results.categories.length > 0 && (
              <CommandGroup heading="Categories">
                {results.categories.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`cat-${c.name}`}
                    onSelect={() => {
                      pushRecent(c.name);
                      onOpenChange(false);
                      navigate({ to: "/categories/$slug", params: { slug: c.slug } });
                    }}
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
                    onSelect={() => goToMarketplace(b)}
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
                    value={p.name}
                    onSelect={() => {
                      pushRecent(p.name);
                      onOpenChange(false);
                      navigate({ to: "/products/$slug", params: { slug: p.slug } });
                    }}
                    className="gap-3"
                  >
                    <img src={p.image} alt="" className="h-9 w-9 rounded-md object-cover" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.brand} · {p.supplier.name}</span>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        {!query && recent.length > 0 && (
          <>
            <CommandGroup heading="Recent searches">
              {recent.map((r) => (
                <CommandItem key={r} value={r} onSelect={() => goToMarketplace(r)}>
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {r}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {!query && (
          <>
            <CommandGroup heading="Trending searches">
              {TRENDING_SEARCHES.map((t) => (
                <CommandItem key={t} value={t} onSelect={() => goToMarketplace(t)}>
                  <TrendingUp className="mr-2 h-4 w-4 text-warning" />
                  {t}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Browse categories">
              {categories.slice(0, 6).map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    onOpenChange(false);
                    navigate({ to: "/categories/$slug", params: { slug: c.slug } });
                  }}
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
