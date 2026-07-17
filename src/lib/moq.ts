import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/commerce";

/** Minimum order quantity for a cart line (defaults to 1). */
export function lineMoq(item: Pick<CartItem, "product_snapshot">): number {
  return Math.max(1, item.product_snapshot?.moq ?? 1);
}

/** Resolve MOQ preferring live seller value from `products.moq` when available. */
export function resolveLineMoq(
  item: Pick<CartItem, "product_id" | "product_snapshot">,
  liveMoqByProductId?: Map<string, number>,
): number {
  const live = liveMoqByProductId?.get(item.product_id);
  if (live != null) return Math.max(1, live);
  return lineMoq(item);
}

/** Batch-fetch current MOQ values from the products table (seller-entered). */
export async function fetchLiveMoqMap(productIds: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(productIds.filter(Boolean))];
  if (!unique.length) return new Map();
  const { data, error } = await supabase.from("products").select("id, moq").in("id", unique);
  if (error) throw error;
  return new Map(
    (data ?? []).map((row) => [String(row.id), Math.max(1, Number(row.moq) || 1)]),
  );
}

/** Merge live product MOQ into cart line snapshots so checks use seller values, not stale JSON. */
export function applyLiveMoqToItems<T extends Pick<CartItem, "product_id" | "product_snapshot">>(
  items: T[],
  liveMoqByProductId: Map<string, number>,
): T[] {
  return items.map((item) => {
    const live = liveMoqByProductId.get(item.product_id);
    if (live == null) return item;
    const moq = Math.max(1, live);
    if (item.product_snapshot.moq === moq) return item;
    return {
      ...item,
      product_snapshot: { ...item.product_snapshot, moq },
    };
  });
}

/** Throws when any line is below its live minimum order quantity. */
export async function assertOrderMeetsMoq(
  items: Pick<CartItem, "product_id" | "quantity" | "product_snapshot">[],
): Promise<void> {
  const moqMap = await fetchLiveMoqMap(items.map((i) => i.product_id));
  for (const item of items) {
    const required = resolveLineMoq(item, moqMap);
    if (item.quantity < required) {
      throw new Error(moqErrorMessage({ product_snapshot: { ...item.product_snapshot, moq: required } }));
    }
  }
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
