import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { computeTotals } from "@/lib/commerce";
import type { Coupon } from "@/types/commerce";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — VyaparSetu" }] }),
  component: CartPage,
});

function CartPage() {
  const { data: items = [], isLoading } = useCart();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const navigate = useNavigate();

  const active = items.filter((i) => !i.saved_for_later);
  const saved = items.filter((i) => i.saved_for_later);

  const breakup = useMemo(() => computeTotals(active, null, coupon), [active, coupon]);

  return (
    
      <div className="container-page py-8">
        <PageHeader
          title="Your cart"
          description={`${active.length} ${active.length === 1 ? "item" : "items"} · Bulk pricing applied`}
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
              <CouponInput
                subtotal={breakup.subtotal}
                coupon={coupon}
                onApply={setCoupon}
                onClear={() => setCoupon(null)}
              />
              <PriceSummary breakup={breakup} itemCount={active.length} />
              <Button
                size="lg"
                className="w-full shadow-brand"
                disabled={active.length === 0}
                onClick={() =>
                  navigate({ to: "/checkout", search: { coupon: coupon?.code ?? "" } })
                }
              >
                Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
                Free shipping on orders above ₹10,000. GST invoices on every order.
              </div>
            </aside>

            {/* Mobile sticky bar */}
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 shadow-elevated lg:hidden"
            >
              <div className="container-page flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground">Grand total</div>
                  <div className="text-lg font-bold">
                    {breakup.grandTotal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </div>
                </div>
                <Button
                  className="shadow-brand"
                  disabled={active.length === 0}
                  onClick={() => navigate({ to: "/checkout", search: { coupon: coupon?.code ?? "" } })}
                >
                  Checkout
                </Button>
              </div>
            </motion.div>
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
