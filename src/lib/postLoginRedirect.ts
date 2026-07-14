import { supabase } from "@/integrations/supabase/client";
import { getSessionMode } from "@/lib/sessionMode";

/**
 * Resolve where a user should land after a successful auth event.
 *
 * Priority:
 *  1. Session mode chosen at sign-in (buyer → /marketplace, seller → /supplier)
 *  2. Admin table → /admin
 *  3. Sellers table → /supplier
 *  4. Buyers / unknown → /marketplace
 */
export async function resolvePostLoginPath(userId: string): Promise<string> {
  const mode = getSessionMode();
  if (mode === "seller") return "/supplier";
  if (mode === "buyer") return "/marketplace";

  try {
    const [admin, seller] = await Promise.all([
      supabase.from("admins").select("id").eq("id", userId).maybeSingle(),
      supabase.from("sellers").select("id").eq("id", userId).maybeSingle(),
    ]);
    if (admin.data) return "/admin";
    if (seller.data) return "/supplier";
    return "/marketplace";
  } catch {
    return "/marketplace";
  }
}
