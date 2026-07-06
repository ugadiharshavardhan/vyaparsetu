import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WishlistItem, ProductSnapshot } from "@/types/commerce";
import { toast } from "sonner";

const KEY = ["wishlist"] as const;

export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async (): Promise<WishlistItem[]> => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as WishlistItem[];
    },
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ snapshot }: { snapshot: ProductSnapshot }) => {
      if (!user) throw new Error("Please sign in to save products");
      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", snapshot.id)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
        if (error) throw error;
        return { removed: true };
      }
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: snapshot.id, product_snapshot: snapshot as never });
      if (error) throw error;
      return { removed: false };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(res.removed ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
