import type { CartItem } from "@/types/commerce";

/** Minimum order quantity for a cart line (defaults to 1). */
export function lineMoq(item: Pick<CartItem, "product_snapshot">): number {
  return Math.max(1, item.product_snapshot?.moq ?? 1);
}

/** True when the line quantity is below the product's minimum order quantity. */
export function isBelowMoq(item: Pick<CartItem, "quantity" | "product_snapshot">): boolean {
  return item.quantity < lineMoq(item);
}

/** Cart lines that do not meet their minimum order quantity. */
export function findBelowMoqItems<T extends Pick<CartItem, "quantity" | "product_snapshot">>(
  items: T[],
): T[] {
  return items.filter((i) => isBelowMoq(i));
}

/** Human-readable message explaining the MOQ shortfall for a line. */
export function moqErrorMessage(item: Pick<CartItem, "product_snapshot">): string {
  const p = item.product_snapshot;
  const moq = lineMoq(item);
  const unit = p?.unit ?? "units";
  const name = p?.name ?? "This item";
  return `Minimum order quantity for ${name} is ${moq} ${unit}. Increase the quantity to continue.`;
}
