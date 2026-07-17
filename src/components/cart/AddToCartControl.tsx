import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/types";
import type { ProductSnapshot } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { useAddToCart, useCartLine, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { setPendingCartAdd } from "@/lib/pendingCart";
import { toSnapshot } from "@/lib/commerce";
import { cn } from "@/lib/utils";

type Props = {
  product?: Product;
  /** Use when only a cart/wishlist snapshot is available (e.g. saved items). */
  snapshot?: ProductSnapshot;
  size?: "sm" | "lg";
  className?: string;
  /** Extra units beyond MOQ when first adding (PDP qty selector) */
  initialQuantity?: number;
  showLabel?: boolean;
};

export function AddToCartControl({
  product,
  snapshot: snapshotProp,
  size = "sm",
  className,
  initialQuantity,
  showLabel = true,
}: Props) {
  const snapshot = snapshotProp ?? (product ? toSnapshot(product) : null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const line = useCartLine(snapshot?.id);
  const add = useAddToCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const moq = Math.max(1, line?.product_snapshot.moq ?? snapshot?.moq ?? 1);
  const stockCount = snapshot?.stockCount ?? 0;
  const inStock = product?.inStock ?? stockCount > 0;
  const pending = add.isPending || update.isPending || remove.isPending;

  if (!snapshot) return null;

  const requireAuthThenAdd = () => {
    const qty = Math.max(initialQuantity ?? moq, moq);
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/marketplace";

    setPendingCartAdd({
      snapshot,
      quantity: qty,
      returnTo,
    });
    toast.message("Sign in to add this item to your cart");
    navigate({
      to: "/auth",
      search: { mode: "signin", role: "buyer", redirect: returnTo },
    });
  };

  const changeQty = (next: number) => {
    if (!user) {
      requireAuthThenAdd();
      return;
    }
    if (!line) return;
    if (next < moq) {
      toast.error(`Minimum order is ${moq} ${snapshot.unit}`);
      return;
    }
    if (next > stockCount) {
      toast.error(`Only ${stockCount} in stock`);
      return;
    }
    update.mutate({ id: line.id, quantity: next });
  };

  if (!inStock) {
    return (
      <Button size={size} className={cn("flex-1", className)} disabled>
        Out of stock
      </Button>
    );
  }

  if (line && user) {
    return (
      <div
        className={cn(
          "inline-flex flex-1 items-center justify-between rounded-full border border-brand/40 bg-white shadow-soft",
          size === "lg" ? "h-11" : "h-9",
          className,
        )}
        onClick={(e) => e.preventDefault()}
      >
        <button
          type="button"
          disabled={pending || line.quantity <= moq}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changeQty(line.quantity - 1);
          }}
          className="grid h-full w-10 place-items-center rounded-l-full text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <div className="min-w-[2.5rem] px-1 text-center text-sm font-semibold tabular-nums text-foreground">
          {line.quantity}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changeQty(line.quantity + 1);
          }}
          className="grid h-full w-10 place-items-center rounded-r-full text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  const label = size === "lg" ? "Add to cart" : "Add";

  return (
    <Button
      size={size}
      className={cn("flex-1 shadow-brand", className)}
      loading={pending || authLoading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (authLoading) return;
        if (!user) {
          requireAuthThenAdd();
          return;
        }
        add.mutate({ snapshot, quantity: initialQuantity ?? moq, openSheet: false });
      }}
    >
      {!pending && !authLoading && (
        <ShoppingCart
          className={cn(
            size === "lg" ? "mr-1.5 h-4 w-4" : "h-3.5 w-3.5",
            showLabel && size !== "lg" && "mr-1.5",
          )}
        />
      )}
      {showLabel ? (pending ? "Adding…" : label) : null}
    </Button>
  );
}
