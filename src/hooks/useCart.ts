import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem, ProductSnapshot } from "@/types/commerce";
import { toast } from "sonner";

const KEY = ["cart"] as const;

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

export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 15_000,
    retry: 1,
    queryFn: async (): Promise<CartItem[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((row) => normalizeCartRow(row as unknown as Record<string, unknown>))
        .filter((row): row is CartItem => row !== null);
    },
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      snapshot,
      quantity,
    }: {
      snapshot: ProductSnapshot;
      quantity?: number;
    }) => {
      if (!user) throw new Error("Please sign in to add to cart");
      const safe = normalizeSnapshot(snapshot);
      if (!safe) throw new Error("Invalid product");
      const qty = Math.max(quantity ?? safe.moq, safe.moq);
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
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Added to cart");
    },
    onError: (e: Error) => toast.error(e.message || "Could not add to cart"),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
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
      const patch: { quantity?: number; saved_for_later?: boolean } = {};
      if (quantity !== undefined) patch.quantity = quantity;
      if (saved_for_later !== undefined) patch.saved_for_later = saved_for_later;
      const { error } = await supabase.from("cart_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: Error) => toast.error(e.message || "Could not update cart"),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: Error) => toast.error(e.message || "Could not remove item"),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
