import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Loader2, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCartRelatedProducts } from "@/hooks/useCatalog";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { computeTotals } from "@/lib/commerce";
import { findBelowMoqItems, moqErrorMessage } from "@/lib/moq";
import { toast } from "sonner";
import type { Coupon } from "@/types/commerce";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — VyaparSetu" }] }),
  component: CartPage,
});

function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: items = [], isLoading, isError, error, refetch, isFetching } = useCart();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const navigate = useNavigate();

  const active = items.filter((i) => !i.saved_for_later);
  const saved = items.filter((i) => i.saved_for_later);

  const cartExcludeIds = useMemo(() => active.map((i) => i.product_id), [active]);
  const cartCategories = useMemo(
    () =>
      Array.from(
        new Set(
          active
            .map((i) => i.product_snapshot?.category)
            .filter((c): c is string => !!c && c.trim().length > 0),
        ),
      ),
    [active],
  );
  const { data: related = [], isLoading: relatedLoading } = useCartRelatedProducts({
    excludeIds: cartExcludeIds,
    categoryHints: cartCategories,
    limit: 8,
    enabled: active.length > 0,
  });

  const breakup = useMemo(() => {
    try {
      return computeTotals(active, null, coupon);
    } catch {
      return computeTotals([], null, null);
    }
  }, [active, coupon]);

  const belowMoq = useMemo(() => findBelowMoqItems(active), [active]);

  const goCheckout = () => {
    if (authLoading) {
      toast.message("Checking your session…");
      return;
    }
    if (!isAuthenticated) {
      navigate({
        to: "/auth",
        search: {
          mode: "signin",
          role: "buyer",
          redirect: `/checkout${coupon?.code ? `?coupon=${coupon.code}` : ""}`,
        },
      });
      return;
    }
    if (belowMoq.length > 0) {
      toast.error(moqErrorMessage(belowMoq[0]));
      return;
    }
    void navigate({
      to: "/checkout",
      search: coupon?.code ? { coupon: coupon.code } : {},
    });
  };

  if (isError) {
    return (
      <div className="container-page py-8">
        <PageHeader title="Your cart" description="We couldn't load your cart right now." />
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message || "Please try again."}
          </p>
          <Button className="mt-5 shadow-brand" loading={isFetching} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 pb-24 lg:pb-8">
      <PageHeader
        title="Your cart"
        description={
          !isAuthenticated
            ? `${active.length} ${active.length === 1 ? "item" : "items"} · Guest cart (sign in to checkout)`
            : `${active.length} ${active.length === 1 ? "item" : "items"} · Bulk pricing applied`
        }
      />

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : active.length === 0 && saved.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {active.length > 0 && (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {active.map((it) => (
                    <CartItemRow key={it.id} item={it} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {saved.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bookmark className="h-4 w-4" /> Saved for later ({saved.length})
                </div>
                <div className="space-y-3">
                  {saved.map((it) => (
                    <CartItemRow key={it.id} item={it} />
                  ))}
                </div>
              </div>
            )}

            {active.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Your active cart is empty. Move items back from “Saved for later” to check out.
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-max">
            {isAuthenticated ? (
              <CouponInput
                subtotal={breakup.subtotal}
                coupon={coupon}
                onApply={setCoupon}
                onClear={() => setCoupon(null)}
              />
            ) : (
              <div className="rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                Sign in to apply coupons and place your order. Items in this guest cart will merge into your account.
              </div>
            )}
            <PriceSummary breakup={breakup} itemCount={active.length} />
            {belowMoq.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[11px] font-medium text-destructive">
                Some items are below their minimum order quantity. Increase them to place your order.
              </div>
            )}
            <Button
              size="lg"
              className="w-full shadow-brand"
              disabled={active.length === 0 || belowMoq.length > 0}
              onClick={goCheckout}
            >
              {isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
              Free shipping on orders above ₹10,000. GST invoices on every order.
            </div>
          </aside>

          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 shadow-elevated lg:hidden"
          >
            <div className="container-page flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-muted-foreground">Grand total</div>
                <div className="text-lg font-bold">
                  {breakup.grandTotal.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>
              <Button
                className="shadow-brand"
                disabled={active.length === 0 || belowMoq.length > 0}
                onClick={goCheckout}
              >
                {isAuthenticated ? "Checkout" : "Sign in"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {active.length > 0 && (relatedLoading || related.length > 0) && (
        <div className="mt-12 pb-20 lg:pb-0">
          <SectionHeading
            align="left"
            eyebrow="Based on your cart"
            title="You might also like"
            description="More wholesale products from the same categories as items in your cart."
          />
          <div className="mt-6">
            {relatedLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-brand" /> Loading suggestions…
              </div>
            ) : (
              <ProductGrid products={related} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-bold">Your cart is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse thousands of wholesale SKUs from verified suppliers across India.
      </p>
      <Button asChild className="mt-5 shadow-brand">
        <Link to="/marketplace">Browse marketplace</Link>
      </Button>
    </div>
  );
}
