import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AccountKind = "buyer" | "seller" | "admin";

export type AccountFlags = {
  isBuyer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  kinds: AccountKind[];
};

/**
 * Loads which account tables the signed-in user belongs to.
 * Buyers / sellers / admins are separate DB tables (user_roles removed).
 */
export function useAccountFlags() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["account-flags", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<AccountFlags> => {
      const userId = user!.id;
      const [buyer, seller, admin] = await Promise.all([
        supabase.from("buyers").select("id").eq("id", userId).maybeSingle(),
        supabase.from("sellers").select("id").eq("id", userId).maybeSingle(),
        supabase.from("admins").select("id").eq("id", userId).maybeSingle(),
      ]);
      if (buyer.error || seller.error || admin.error) {
        console.warn("[account-flags]", buyer.error || seller.error || admin.error);
      }

      const isBuyer = !!buyer.data;
      const isSeller = !!seller.data;
      const isAdmin = !!admin.data;
      const kinds: AccountKind[] = [];
      if (isAdmin) kinds.push("admin");
      if (isSeller) kinds.push("seller");
      if (isBuyer) kinds.push("buyer");
      return { isBuyer, isSeller, isAdmin, kinds };
    },
  });
}
