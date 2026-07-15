import type { ProductSnapshot } from "@/types/commerce";

const KEY = "vs.pending-cart-add";

export type PendingCartAdd = {
  snapshot: ProductSnapshot;
  quantity: number;
  returnTo: string;
};

export function setPendingCartAdd(item: PendingCartAdd) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(item));
  } catch {
    /* ignore quota */
  }
}

export function peekPendingCartAdd(): PendingCartAdd | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCartAdd;
    if (!parsed?.snapshot?.id || !parsed?.snapshot?.slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function takePendingCartAdd(): PendingCartAdd | null {
  const item = peekPendingCartAdd();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  return item;
}

export function clearPendingCartAdd() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
