import type { CartItem, ProductSnapshot } from "@/types/commerce";

const GUEST_KEY = "vs.guest-cart.v1";

export type GuestCartLine = Omit<CartItem, "user_id"> & { user_id: "guest" };

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vs-guest-cart"));
  }
}

export function readGuestCart(): GuestCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l) => l?.product_id && l?.product_snapshot?.id);
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  notify();
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_KEY);
  notify();
}

export function guestLineId(productId: string) {
  return `guest-${productId}`;
}

export function upsertGuestLine(snapshot: ProductSnapshot, quantity: number): GuestCartLine[] {
  const items = readGuestCart();
  const qty = Math.max(quantity, snapshot.moq);
  const existing = items.find((i) => i.product_id === snapshot.id);
  const now = new Date().toISOString();
  if (existing) {
    const next = items.map((i) =>
      i.product_id === snapshot.id
        ? {
            ...i,
            quantity: i.quantity + qty,
            product_snapshot: snapshot,
            saved_for_later: false,
            updated_at: now,
          }
        : i,
    );
    writeGuestCart(next);
    return next;
  }
  const line: GuestCartLine = {
    id: guestLineId(snapshot.id),
    user_id: "guest",
    product_id: snapshot.id,
    product_snapshot: snapshot,
    quantity: qty,
    saved_for_later: false,
    sample_requested: false,
    created_at: now,
    updated_at: now,
  };
  const next = [...items, line];
  writeGuestCart(next);
  return next;
}

export function updateGuestLine(
  id: string,
  patch: { quantity?: number; saved_for_later?: boolean; sample_requested?: boolean },
): GuestCartLine[] {
  const now = new Date().toISOString();
  const next = readGuestCart().map((i) =>
    i.id === id
      ? {
          ...i,
          ...(patch.quantity !== undefined ? { quantity: patch.quantity } : {}),
          ...(patch.saved_for_later !== undefined ? { saved_for_later: patch.saved_for_later } : {}),
          ...(patch.sample_requested !== undefined ? { sample_requested: patch.sample_requested } : {}),
          updated_at: now,
        }
      : i,
  );
  writeGuestCart(next);
  return next;
}

export function removeGuestLine(id: string): GuestCartLine[] {
  const next = readGuestCart().filter((i) => i.id !== id);
  writeGuestCart(next);
  return next;
}
