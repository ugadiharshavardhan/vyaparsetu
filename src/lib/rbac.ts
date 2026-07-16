import { supabase } from "@/integrations/supabase/client";

export type AppRole = "buyer" | "seller" | "admin" | "porter";

/**
 * Fetch the user's role by checking the specific role tables.
 * Returns the first role matched in this order: admin -> seller -> buyer.
 */
export async function getUserRole(userId: string): Promise<AppRole | null> {
  try {
    const [admin, seller, buyer] = await Promise.all([
      supabase.from("admins").select("id").eq("id", userId).maybeSingle(),
      supabase.from("sellers").select("id").eq("id", userId).maybeSingle(),
      supabase.from("buyers").select("id").eq("id", userId).maybeSingle(),
    ]);

    if (admin.data) return "admin";
    if (seller.data) return "seller";
    if (buyer.data) return "buyer";
    
    return null;
  } catch (error) {
    return null;
  }
}
