import { ShoppingCart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/types";
import type { ProductSnapshot } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { CartQuantityStepper } from "@/components/cart/CartQuantityStepper";
import { useAddToCart, useCartLine, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { setPendingCartAdd } from "@/lib/pendingCart";
import { toSnapshot } from "@/lib/commerce";
import { resolveAuthedUser } from "@/lib/resolveAuthedUser";
import { resolveDisplayMoq } from "@/lib/moq";
import { cn } from "@/lib/utils";

type Props = {
  product?: Product;
  /** Use when only a cart/wishlist snapshot is available (e.g. saved items). */
  snapshot?: ProductSnapshot;
  size?: "sm" | "lg";
  /** Styles applied to the Add button and the quantity stepper. */
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const line = useCartLine(snapshot?.id);
  const add = useAddToCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const moq = resolveDisplayMoq({
    productMoq: product?.moq,
    snapshotMoq: snapshot?.moq,
    lineSnapshotMoq: line?.product_snapshot.moq,
  });
  const stockCount =
    line?.product_snapshot.stockCount ?? snapshot?.stockCount ?? product?.stockCount ?? 0;
  const inStock = product?.inStock ?? stockCount > 0;
  const pending = add.isPending || update.isPending;

  if (!snapshot) return null;

  const requireAuthThenAdd = () => {
    const qty = Math.max(initialQuantity ?? moq, moq);
    // After a guest signs in, land them on the cart with the clicked item added
    // (the pending snapshot is flushed into cart_items by the useCart post-login effect).
    const returnTo = "/cart";

    setPendingCartAdd({
      snapshot,
      quantity: qty,
      returnTo,
    });
    toast.message("Sign in to add this item to your cart");
    void navigate({
      to: "/auth",
      search: { mode: "signin", role: "buyer", redirect: returnTo },
    });
  };

  /** Auth context can lag behind Supabase during hydration — confirm before adding. */
  const confirmAuthed = async () => {
    if (isAuthenticated && user) return true;
    const resolved = await resolveAuthedUser();
    return !!resolved;
  };

  if (!inStock) {
    return (
      <Button size={size} className={cn("flex-1", className)} disabled>
        Out of stock
      </Button>
    );
  }

  if (line && isAuthenticated) {
    return (
      <CartQuantityStepper
        quantity={line.quantity}
        moq={moq}
        stockCount={stockCount}
        pending={pending}
        size={size === "lg" ? "lg" : "sm"}
        className={cn(
          "flex-1",
          size === "lg" ? "min-w-0" : "min-w-[7rem] max-w-[9rem]",
          className,
        )}
        onQuantityChange={(next) => update.mutate({ id: line.id, quantity: next })}
        onRemove={() => remove.mutate(line.id)}
        onBlocked={(delta) => {
          if (delta > 0) {
            toast.error(`Only ${stockCount} in stock`);
          }
        }}
      />
    );
  }

  const label = size === "lg" ? "Add to cart" : "Add";

  return (
    <Button
      type="button"
      size={size}
      className={cn("flex-1 shadow-brand", className)}
      loading={pending}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!(await confirmAuthed())) {
          requireAuthThenAdd();
          return;
        }
        add.mutate({
          snapshot,
          quantity: Math.max(initialQuantity ?? moq, moq),
          openSheet: false,
        });
      }}
    >
      {!pending && (
        <ShoppingCart
          className={cn(
            size === "lg" ? "mr-1.5 h-5 w-5" : "h-3.5 w-3.5",
            showLabel && size !== "lg" && "mr-1.5",
          )}
        />
      )}
      {showLabel ? (pending ? "Adding…" : label) : null}
    </Button>
  );
}
