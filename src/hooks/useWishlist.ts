import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WishlistItem, ProductSnapshot } from "@/types/commerce";
import { normalizeSnapshot } from "@/hooks/useCart";
import { toast } from "sonner";

const KEY = ["wishlist"] as const;

function normalizeWishlistRow(row: Record<string, unknown>): WishlistItem | null {
  const snapshot = normalizeSnapshot(row.product_snapshot, row.product_id as string | undefined);
  if (!snapshot) return null;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    product_id: String(row.product_id ?? snapshot.id),
    product_snapshot: snapshot,
    created_at: String(row.created_at ?? ""),
  };
}

export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async (): Promise<WishlistItem[]> => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => normalizeWishlistRow(row as unknown as Record<string, unknown>))
        .filter((row): row is WishlistItem => row !== null);
    },
  });
}

export function useIsSaved(productId: string | undefined) {
  const { data: items = [] } = useWishlist();
  if (!productId) return false;
  return items.some((w) => w.product_id === productId);
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ snapshot }: { snapshot: ProductSnapshot }) => {
      if (!user) throw new Error("Please sign in to save items");
      const safe = normalizeSnapshot(snapshot);
      if (!safe) throw new Error("Invalid product");

      const { data: existing, error: existingError } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", safe.id)
        .maybeSingle();
      if (existingError) throw existingError;

      if (existing) {
        const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
        if (error) throw error;
        return { removed: true as const };
      }

      const { error } = await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: safe.id,
        product_snapshot: safe as never,
      });
      if (error) throw error;
      return { removed: false as const };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(res.removed ? "Removed from saved items" : "Saved to your items");
    },
    onError: (e: Error) => toast.error(e.message || "Could not update saved items"),
  });
}

export function useRemoveWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Removed from saved items");
    },
    onError: (e: Error) => toast.error(e.message || "Could not remove saved item"),
  });
}
