import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ProductReview = {
  id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: {
    fullName: string | null;
    businessName: string | null;
  } | null;
};

const REVIEWS_QUERY_KEY = ["product-reviews"] as const;

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, productId],
    queryFn: async (): Promise<ProductReview[]> => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          id,
          product_id,
          buyer_id,
          rating,
          comment,
          reply,
          created_at,
          updated_at,
          buyers (
            full_name,
            business_name
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        buyerId: row.buyer_id,
        rating: row.rating,
        comment: row.comment,
        reply: row.reply,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        buyer: row.buyers ? {
          fullName: row.buyers.full_name,
          businessName: row.buyers.business_name,
        } : null,
      }));
    },
    enabled: !!productId,
  });
}

export function useCheckPurchase(productId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["check-purchase", productId, user?.id ?? "anon"],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id || !productId) return false;
      const { data, error } = await supabase.rpc("has_purchased_product", {
        _buyer_id: user.id,
        _product_id: productId,
      });
      if (error) {
        return false;
      }
      return !!data;
    },
    enabled: !!user?.id && !!productId,
  });
}

export function useSubmitReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      productId: string;
      rating: number;
      comment: string | null;
    }) => {
      if (!user?.id) throw new Error("Must be logged in to submit a review");

      // Upsert the review (unique constraint unique_product_buyer_review will handle conflicts)
      const { error } = await supabase.from("product_reviews").upsert({
        product_id: vars.productId,
        buyer_id: user.id,
        rating: vars.rating,
        comment: vars.comment,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: "product_id,buyer_id",
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["check-purchase", variables.productId] });
    },
  });
}

export function useDeleteReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { reviewId: string; productId: string }) => {
      if (!user?.id) throw new Error("Must be logged in to delete review");

      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", vars.reviewId)
        .eq("buyer_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["check-purchase", variables.productId] });
    },
  });
}
