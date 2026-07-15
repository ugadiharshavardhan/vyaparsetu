import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem, ProductSnapshot } from "@/types/commerce";
import {
  clearGuestCart,
  readGuestCart,
  removeGuestLine,
  updateGuestLine,
  upsertGuestLine,
} from "@/lib/guestCart";
import { peekPendingCartAdd, setPendingCartAdd, takePendingCartAdd } from "@/lib/pendingCart";
import { openCartSheet } from "@/hooks/useCartSheet";
import { toast } from "sonner";

export const CART_KEY = ["cart"] as const;

/** Normalize DB jsonb into a safe ProductSnapshot (guards missing fields). */
export function normalizeSnapshot(raw: unknown, productId?: string): ProductSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const id = String(s.id ?? productId ?? "");
  const slug = String(s.slug ?? "");
  if (!id || !slug) return null;
  const num = (v: unknown, fallback = 0) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    id,
    slug,
    name: String(s.name ?? "Product"),
    brand: String(s.brand ?? ""),
    image: String(s.image ?? ""),
    wholesalePrice: num(s.wholesalePrice),
    mrp: num(s.mrp),
    moq: Math.max(1, num(s.moq, 1)),
    unit: String(s.unit ?? "unit"),
    gstRate: num(s.gstRate, 18),
    gstIncluded: Boolean(s.gstIncluded),
    stockCount: Math.max(0, num(s.stockCount, 9999)),
    category: String(s.category ?? ""),
    supplierName: String(s.supplierName ?? "Supplier"),
    supplierId: String(s.supplierId ?? ""),
  };
}

function normalizeCartRow(row: Record<string, unknown>): CartItem | null {
  const snapshot = normalizeSnapshot(row.product_snapshot, row.product_id as string | undefined);
  if (!snapshot) return null;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    product_id: String(row.product_id ?? snapshot.id),
    product_snapshot: snapshot,
    quantity: Math.max(1, Number(row.quantity) || 1),
    saved_for_later: Boolean(row.saved_for_later),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

async function fetchUserCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? [])
    .map((row) => normalizeCartRow(row as unknown as Record<string, unknown>))
    .filter((row): row is CartItem => row !== null);
}

async function mergeGuestCartIntoUser(userId: string) {
  const guest = readGuestCart();
  if (!guest.length) return;

  for (const line of guest) {
    const safe = normalizeSnapshot(line.product_snapshot, line.product_id);
    if (!safe) continue;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", safe.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + line.quantity,
          saved_for_later: false,
          product_snapshot: safe as never,
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: safe.id,
        product_snapshot: safe as never,
        quantity: line.quantity,
        saved_for_later: line.saved_for_later,
      });
      if (error) throw error;
    }
  }

  clearGuestCart();
}

/** Prevent concurrent remounts from adding the same pending item twice. */
let pendingCartFlush: Promise<boolean> | null = null;

/** Add the product the guest clicked before they were sent to auth. */
async function flushPendingCartAdd(userId: string) {
  if (pendingCartFlush) return pendingCartFlush;

  pendingCartFlush = (async () => {
    const pending = peekPendingCartAdd();
    if (!pending) return false;

    const safe = normalizeSnapshot(pending.snapshot);
    if (!safe) {
      takePendingCartAdd();
      return false;
    }
    const qty = Math.max(pending.quantity ?? safe.moq, safe.moq);

    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", safe.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty, saved_for_later: false })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: userId,
          product_id: safe.id,
          product_snapshot: safe as never,
          quantity: qty,
        });
        if (error) throw error;
      }
      takePendingCartAdd();
      return true;
    } catch (e) {
      setPendingCartAdd(pending);
      throw e;
    }
  })().finally(() => {
    pendingCartFlush = null;
  });

  return pendingCartFlush;
}

export function useCart() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  // After sign-in: merge guest cart (if any) + add the product they clicked pre-auth
  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;

    (async () => {
      try {
        const guest = readGuestCart();
        if (guest.length) {
          await mergeGuestCartIntoUser(user.id);
        }
        const addedPending = await flushPendingCartAdd(user.id);
        if (cancelled) return;
        await qc.invalidateQueries({ queryKey: CART_KEY });
        if (addedPending) {
          toast.success("Added to cart");
          // Do not auto-open cart drawer — badge / toast is enough
        }
      } catch (e) {
        console.warn("[cart-post-login]", e);
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Could not add item to cart");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading, qc]);

  // Keep guest cart query in sync with localStorage events
  useEffect(() => {
    if (user) return;
    const onChange = () => qc.invalidateQueries({ queryKey: [...CART_KEY, "guest"] });
    window.addEventListener("vs-guest-cart", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("vs-guest-cart", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [user, qc]);

  return useQuery({
    queryKey: [...CART_KEY, user?.id ?? "guest"],
    enabled: !loading,
    staleTime: 15_000,
    retry: 1,
    queryFn: async (): Promise<CartItem[]> => {
      if (user) return fetchUserCart(user.id);
      return readGuestCart() as CartItem[];
    },
  });
}

/** Number of distinct products in the active cart (not sum of quantities). */
export function useCartCount() {
  const { data: items = [] } = useCart();
  return items.filter((i) => !i.saved_for_later).length;
}

export function useCartLine(productId: string | undefined) {
  const { data: items = [] } = useCart();
  if (!productId) return undefined;
  return items.find((i) => i.product_id === productId && !i.saved_for_later);
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      snapshot,
      quantity,
      openSheet = false,
    }: {
      snapshot: ProductSnapshot;
      quantity?: number;
      openSheet?: boolean;
    }) => {
      const safe = normalizeSnapshot(snapshot);
      if (!safe) throw new Error("Invalid product");
      const qty = Math.max(quantity ?? safe.moq, safe.moq);

      if (!user) {
        throw new Error("Please sign in to add items to your cart");
      }

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", safe.id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty, saved_for_later: false })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: safe.id,
          product_snapshot: safe as never,
          quantity: qty,
        });
        if (error) throw error;
      }
      return { openSheet };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Added to cart");
      // Cart drawer only opens when explicitly requested (e.g. View cart)
      if (res?.openSheet === true) openCartSheet();
    },
    onError: (e: Error) => toast.error(e.message || "Could not add to cart"),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      quantity,
      saved_for_later,
    }: {
      id: string;
      quantity?: number;
      saved_for_later?: boolean;
    }) => {
      if (!user) {
        updateGuestLine(id, { quantity, saved_for_later });
        return;
      }
      const patch: { quantity?: number; saved_for_later?: boolean } = {};
      if (quantity !== undefined) patch.quantity = quantity;
      if (saved_for_later !== undefined) patch.saved_for_later = saved_for_later;
      const { error } = await supabase.from("cart_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
    onError: (e: Error) => toast.error(e.message || "Could not update cart"),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        removeGuestLine(id);
        return;
      }
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
    onError: (e: Error) => toast.error(e.message || "Could not remove item"),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) {
        clearGuestCart();
        return;
      }
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useSetCartQuantity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const add = useAddToCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();

  return {
    isPending: add.isPending || update.isPending || remove.isPending,
    setQuantity: async ({
      productId,
      snapshot,
      quantity,
      lineId,
      moq,
    }: {
      productId: string;
      snapshot: ProductSnapshot;
      quantity: number;
      lineId?: string;
      moq: number;
    }) => {
      if (quantity <= 0) {
        if (lineId) await remove.mutateAsync(lineId);
        return;
      }
      const q = Math.max(quantity, moq);
      if (!lineId) {
        await add.mutateAsync({ snapshot, quantity: q, openSheet: false });
        return;
      }
      // If line already exists, set absolute quantity (not add)
      if (!user) {
        updateGuestLine(lineId, { quantity: q, saved_for_later: false });
        qc.invalidateQueries({ queryKey: CART_KEY });
        return;
      }
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: q, saved_for_later: false })
        .eq("id", lineId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: CART_KEY });
    },
  };
}

type RepeatLine = {
  product_snapshot: ProductSnapshot;
  quantity: number;
};

/** Re-add every line from a past order into the cart (ready to checkout again). */
export function useRepeatOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (items: RepeatLine[]) => {
      if (!items?.length) throw new Error("This order has no items to repeat");

      let added = 0;
      for (const item of items) {
        const safe = normalizeSnapshot(item.product_snapshot);
        if (!safe) continue;
        const qty = Math.max(1, Number(item.quantity) || safe.moq, safe.moq);

        if (!user) {
          upsertGuestLine(safe, qty);
          added += 1;
          continue;
        }

        const { data: existing } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", safe.id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("cart_items")
            .update({
              quantity: existing.quantity + qty,
              saved_for_later: false,
              product_snapshot: safe as never,
            })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: safe.id,
            product_snapshot: safe as never,
            quantity: qty,
          });
          if (error) throw error;
        }
        added += 1;
      }

      if (added === 0) throw new Error("Could not add items from this order");
      return { added };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: CART_KEY });
      toast.success(
        res.added === 1
          ? "1 item added to cart — ready to order again"
          : `${res.added} items added to cart — ready to order again`,
      );
      openCartSheet();
    },
    onError: (e: Error) => toast.error(e.message || "Could not repeat order"),
  });
}
