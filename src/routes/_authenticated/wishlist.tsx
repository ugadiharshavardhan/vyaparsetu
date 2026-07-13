import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemoveWishlist, useWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — VyaparSetu" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { data: items = [], isLoading } = useWishlist();
  const remove = useRemoveWishlist();
  const addToCart = useAddToCart();

  return (
    
      <div className="container-page py-8">
        <PageHeader
          title="Wishlist"
          description={`${items.length} saved ${items.length === 1 ? "product" : "products"} · Compare and reorder anytime`}
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((it) => {
                const p = it.product_snapshot;
                return (
                  <motion.article
                    key={it.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-elevated"
                  >
                    <Link
                      to="/products/$slug"
                      params={{ slug: p.slug }}
                      className="relative aspect-[4/3] overflow-hidden bg-secondary"
                    >
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="text-[11px] uppercase text-muted-foreground">{p.brand}</div>
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold hover:text-brand">
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">{inr(p.wholesalePrice)}</span>
                        {p.mrp > p.wholesalePrice && (
                          <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">MOQ: {p.moq} {p.unit}</div>
                      <div className="mt-auto flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 shadow-brand"
                          onClick={() => addToCart.mutate({ snapshot: p })}
                        >
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add to cart
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => remove.mutate(it.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    
  );
}

function EmptyWishlist() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Heart className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-bold">No favorites yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the heart icon on any product to save it here.
      </p>
      <Button asChild className="mt-5 shadow-brand">
        <Link to="/marketplace">Explore products</Link>
      </Button>
    </div>
  );
}
