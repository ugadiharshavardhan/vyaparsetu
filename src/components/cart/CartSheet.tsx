import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useCartSheet } from "@/hooks/useCartSheet";
import { computeTotals } from "@/lib/commerce";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export function CartSheet() {
  const { open, setOpen } = useCartSheet();
  const { data: items = [], isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();

  const active = items.filter((i) => !i.saved_for_later);
  const breakup = useMemo(() => computeTotals(active, null, null), [active]);

  const goCheckout = () => {
    setOpen(false);
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signin", redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout", search: { coupon: "" } });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-display text-xl">Your cart</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {active.length} {active.length === 1 ? "item" : "items"}
            {!user ? " · Guest cart (saved on this device)" : ""}
          </p>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Add wholesale SKUs to get started.</p>
              </div>
              <Button
                className="mt-2 shadow-brand"
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/marketplace" });
                }}
              >
                Browse marketplace
              </Button>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-5 py-4">
              <ul className="space-y-3">
                {active.map((item) => {
                  const p = item.product_snapshot;
                  const moq = Math.max(1, p.moq);
                  return (
                    <li key={item.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        onClick={() => setOpen(false)}
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary"
                      >
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/products/$slug"
                          params={{ slug: p.slug }}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 text-sm font-semibold hover:text-brand"
                        >
                          {p.name}
                        </Link>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {inr(p.wholesalePrice)} / {p.unit}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-full border border-border">
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-secondary"
                              onClick={() => {
                                const next = item.quantity - 1;
                                if (next < moq) remove.mutate(item.id);
                                else update.mutate({ id: item.id, quantity: next });
                              }}
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-secondary"
                              onClick={() => {
                                const next = item.quantity + 1;
                                if (next > p.stockCount) {
                                  toast.error(`Only ${p.stockCount} in stock`);
                                  return;
                                }
                                update.mutate({ id: item.id, quantity: next });
                              }}
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold">{inr(p.wholesalePrice * item.quantity)}</span>
                            <button
                              type="button"
                              className="grid h-8 w-8 place-items-center text-destructive"
                              onClick={() => remove.mutate(item.id)}
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>

        {active.length > 0 && (
          <div className="space-y-3 border-t border-border p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{inr(breakup.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>Est. total</span>
              <span>{inr(breakup.grandTotal)}</span>
            </div>
            <Button className="w-full shadow-brand" size="lg" onClick={goCheckout}>
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/cart" onClick={() => setOpen(false)}>View full cart</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
