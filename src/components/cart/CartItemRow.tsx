import { motion } from "framer-motion";
import { Heart, Trash2, Bookmark, FlaskConical } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { CartItem } from "@/types/commerce";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useToggleWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CartQuantityStepper } from "@/components/cart/CartQuantityStepper";
import { lineMoq } from "@/lib/moq";

export function CartItemRow({ item }: { item: CartItem }) {
  const p = item.product_snapshot;
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const wish = useToggleWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!p?.slug || !p?.id) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
        <span className="text-muted-foreground">This item could not be loaded.</span>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const moq = lineMoq(item);
  const belowMoq = item.quantity < moq;

  const lineTotal = (p.wholesalePrice || 0) * item.quantity;
  // Cart totals always add GST on top of the listed wholesale price.
  const gst = (lineTotal * (p.gstRate || 0)) / 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row"
    >
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-28 sm:w-28"
      >
        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.brand}</div>
            <Link
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="line-clamp-2 text-sm font-semibold text-foreground hover:text-brand"
            >
              {p.name}
            </Link>
            <div className="mt-1 text-xs text-muted-foreground">Supplier: {p.supplierName}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-foreground">{inr(lineTotal)}</div>
            <div className="text-[11px] text-muted-foreground">
              {inr(p.wholesalePrice)} × {item.quantity} {p.unit}
            </div>
            {gst > 0 && (
              <div className="text-[11px] text-muted-foreground">+ GST {inr(gst)} ({p.gstRate}%)</div>
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <CartQuantityStepper
            quantity={item.quantity}
            moq={moq}
            stockCount={p.stockCount}
            pending={update.isPending}
            onQuantityChange={(next) => update.mutate({ id: item.id, quantity: next })}
            onRemove={() => remove.mutate(item.id)}
            onBlocked={(delta) => {
              if (delta > 0) {
                toast.error(`Only ${p.stockCount} in stock`);
              }
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                update.mutate(
                  { id: item.id, saved_for_later: !item.saved_for_later },
                  { onSuccess: () => toast.success(item.saved_for_later ? "Moved to cart" : "Saved for later") },
                )
              }
            >
              <Bookmark className="mr-1.5 h-4 w-4" />
              {item.saved_for_later ? "Move to cart" : "Save for later"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!user) {
                  navigate({ to: "/auth", search: { mode: "signin", role: "buyer", redirect: "/cart" } });
                  return;
                }
                wish.mutate({ snapshot: p });
                remove.mutate(item.id);
              }}
            >
              <Heart className="mr-1.5 h-4 w-4" />
              Wishlist
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => remove.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <label
          className={`flex w-fit cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            item.sample_requested
              ? "border-brand/40 bg-brand-soft/40 text-brand"
              : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Send me a sample of this item
          <Switch
            checked={item.sample_requested}
            onCheckedChange={(checked) =>
              update.mutate(
                { id: item.id, sample_requested: checked },
                {
                  onSuccess: () =>
                    toast.success(
                      checked
                        ? "Sample requested — it will reach you 1–2 days before delivery, and your order confirms after you approve it"
                        : "Sample request removed",
                    ),
                },
              )
            }
            className="ml-1 scale-90"
            aria-label="Send sample for this item"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground">
            MOQ {p.moq} {p.unit}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5">Stock: {p.stockCount}</span>
          {belowMoq && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
              Add at least {moq} {p.unit} to order
            </span>
          )}
          {!belowMoq && item.quantity >= p.moq * 5 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
              Bulk order — eligible for extra discount
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
