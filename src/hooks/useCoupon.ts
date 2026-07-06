import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Coupon } from "@/types/commerce";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }): Promise<Coupon> => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .ilike("code", code.trim())
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Invalid coupon code");
      const c = data as unknown as Coupon;
      if (c.valid_until && new Date(c.valid_until) < new Date()) {
        throw new Error("Coupon has expired");
      }
      if (subtotal < c.min_order_value) {
        throw new Error(
          `Minimum order value ₹${c.min_order_value.toLocaleString("en-IN")} required`,
        );
      }
      return c;
    },
  });
}
