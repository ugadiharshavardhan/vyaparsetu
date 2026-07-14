import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import type { ProductSnapshot } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { useAddToCart, useCartLine, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { toSnapshot } from "@/lib/commerce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const line = useCartLine(snapshot?.id);
  const add = useAddToCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const moq = Math.max(1, snapshot?.moq ?? 1);
  const stockCount = snapshot?.stockCount ?? 0;
  const inStock = product?.inStock ?? stockCount > 0;
  const pending = add.isPending || update.isPending || remove.isPending;

  if (!snapshot) return null;

  const changeQty = (next: number) => {
    if (!line) return;
    if (next < moq) {
      remove.mutate(line.id);
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

  if (line) {
    return (
      <div
        className={cn(
          "inline-flex flex-1 items-center justify-between rounded-full border border-border bg-background shadow-soft",
          size === "lg" ? "h-11" : "h-9",
          className,
        )}
        onClick={(e) => e.preventDefault()}
      >
        <button
          type="button"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changeQty(line.quantity - 1);
          }}
          className="grid h-full w-10 place-items-center text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="min-w-[2.5rem] px-1 text-center text-sm font-semibold tabular-nums">
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
          className="grid h-full w-10 place-items-center text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const label = size === "lg" ? "Add to cart" : "Add";

  return (
    <Button
      size={size}
      className={cn("flex-1 shadow-brand", className)}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add.mutate({ snapshot, quantity: initialQuantity ?? moq });
      }}
    >
      <ShoppingCart className={cn(size === "lg" ? "mr-1.5 h-4 w-4" : "h-3.5 w-3.5", showLabel && size !== "lg" && "mr-1.5")} />
      {showLabel ? label : null}
    </Button>
  );
}
