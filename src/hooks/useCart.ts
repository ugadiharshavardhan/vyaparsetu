import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem, ProductSnapshot } from "@/types/commerce";
import { toast } from "sonner";

const KEY = ["cart"] as const;

export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async (): Promise<CartItem[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CartItem[];
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
      const qty = Math.max(quantity ?? snapshot.moq, snapshot.moq);
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", snapshot.id)
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
          product_id: snapshot.id,
          product_snapshot: snapshot as never,
          quantity: qty,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Added to cart");
    },
    onError: (e: Error) => toast.error(e.message),
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
      const patch: Record<string, unknown> = {};
      if (quantity !== undefined) patch.quantity = quantity;
      if (saved_for_later !== undefined) patch.saved_for_later = saved_for_later;
      const { error } = await supabase.from("cart_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: Error) => toast.error(e.message),
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
