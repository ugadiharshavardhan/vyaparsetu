import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Check, FlaskConical, Loader2, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsByCategories } from "@/hooks/useCatalog";
import { useAddSampleToCart, useCart } from "@/hooks/useCart";
import { toSampleSnapshot, SAMPLE_ITEM_PRICE, SAMPLE_DELIVERY_FEE } from "@/lib/commerce";
import { CATEGORIES } from "@/data/categories";
import { inr } from "@/lib/format";
import type { Product } from "@/types";

export const Route = createFileRoute("/_authenticated/samples")({
  head: () => ({ meta: [{ title: "Sample Store — VyaparSetu" }] }),
  component: SamplesPage,
});

/** Categories offered in the Sample Store. */
const SAMPLE_CATEGORY_SLUGS = ["rice-products", "pulses-dal", "food-grains-cereals"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "rice-products": "Rice Products",
  "pulses-dal": "Pulses (Dal)",
  "food-grains-cereals": "Food Grains & Cereals",
};

function humanize(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function subcategoryLabel(categorySlug: string, subSlug: string | undefined) {
  if (!subSlug) return "Other items";
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  const sub = cat?.subCategories?.find((s) => s.slug === subSlug || s.name === subSlug);
  return sub?.name ?? humanize(subSlug);
}

function SampleProductCard({
  product,
  inCart,
  onAdd,
  adding,
}: {
  product: Product;
  inCart: boolean;
  onAdd: () => void;
  adding: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative aspect-square w-full overflow-hidden bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
          Sample
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand && (
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </div>
        )}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-brand"
        >
          {product.name}
        </Link>
        <div className="text-[11px] text-muted-foreground">
          Bulk price {inr(product.wholesalePrice)} / {product.unit} · MOQ {product.moq}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            <div className="text-base font-bold text-foreground">{inr(SAMPLE_ITEM_PRICE)}</div>
            <div className="text-[10px] text-muted-foreground">per sample</div>
          </div>
          {inCart ? (
            <Button asChild size="sm" variant="outline" className="rounded-full border-brand/40 text-brand">
              <Link to="/cart">
                <Check className="mr-1 h-3.5 w-3.5" />
                In cart
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-full bg-brand text-white shadow-brand hover:bg-brand/90"
              disabled={adding}
              onClick={onAdd}
            >
              {adding ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="mr-1 h-3.5 w-3.5" />
              )}
              Add sample
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SamplesPage() {
  const { data: products = [], isLoading } = useProductsByCategories([...SAMPLE_CATEGORY_SLUGS]);
  const { data: cartItems = [] } = useCart();
  const addSample = useAddSampleToCart();

  // Real product ids that already have a sample line in the cart.
  const sampledIds = useMemo(
    () =>
      new Set(
        cartItems
          .filter((i) => i.product_snapshot?.isSample && !i.saved_for_later)
          .map((i) => i.product_snapshot.id),
      ),
    [cartItems],
  );
  const sampleCount = sampledIds.size;

  // category slug → subcategory slug → products
  const grouped = useMemo(() => {
    const byCategory = new Map<string, Map<string, Product[]>>();
    for (const slug of SAMPLE_CATEGORY_SLUGS) byCategory.set(slug, new Map());
    for (const p of products) {
      const cat = byCategory.get(p.category);
      if (!cat) continue;
      const key = p.subCategory ?? "";
      const list = cat.get(key) ?? [];
      list.push(p);
      cat.set(key, list);
    }
    return byCategory;
  }, [products]);

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
              <FlaskConical className="h-5 w-5" />
            </span>
            Sample Store
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Try before you order in bulk. Every sample costs a flat{" "}
            <span className="font-semibold text-foreground">{inr(SAMPLE_ITEM_PRICE)}</span> per item
            plus a <span className="font-semibold text-foreground">{inr(SAMPLE_DELIVERY_FEE)}</span>{" "}
            delivery charge per order. Once you check the sample, approve the seller&apos;s request
            under <Link to="/requests" className="font-medium text-brand hover:underline">Requests</Link>{" "}
            and place your bulk order.
          </p>
        </div>
        {sampleCount > 0 && (
          <Button asChild className="rounded-full bg-brand text-white shadow-brand hover:bg-brand/90">
            <Link to="/checkout">
              Checkout {sampleCount} {sampleCount === 1 ? "sample" : "samples"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <Truck className="h-4 w-4 shrink-0" />
        Samples are delivered ahead of any bulk order so you can check quality first. Sample charge:
        ₹100 per item + ₹50 delivery per order.
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-base font-semibold text-foreground">No sample items available</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Sample products from Rice, Pulses (Dal) and Food Grains categories will appear here.
          </p>
        </div>
      ) : (
        SAMPLE_CATEGORY_SLUGS.map((categorySlug) => {
          const subMap = grouped.get(categorySlug);
          if (!subMap || subMap.size === 0) return null;
          const subEntries = [...subMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
          return (
            <section key={categorySlug} className="space-y-5">
              <div className="border-b border-border pb-2">
                <h2 className="font-display text-lg font-bold text-foreground">
                  {CATEGORY_LABELS[categorySlug] ?? humanize(categorySlug)}
                </h2>
              </div>
              {subEntries.map(([subSlug, subProducts]) => (
                <div key={subSlug || "other"} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {subcategoryLabel(categorySlug, subSlug || undefined)}
                    <span className="ml-2 text-[11px] font-normal normal-case">
                      {subProducts.length} {subProducts.length === 1 ? "item" : "items"}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {subProducts.map((p) => (
                      <SampleProductCard
                        key={p.id}
                        product={p}
                        inCart={sampledIds.has(p.id)}
                        adding={addSample.isPending && addSample.variables?.snapshot.id === p.id}
                        onAdd={() => addSample.mutate({ snapshot: toSampleSnapshot(p) })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
