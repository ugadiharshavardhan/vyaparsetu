import { supabase } from "@/integrations/supabase/client";
import { getSessionMode } from "@/lib/sessionMode";

/**
 * Resolve where a user should land after a successful auth event.
 *
 * Priority:
 *  1. Session mode chosen at sign-in (buyer → /marketplace, seller → /supplier)
 *  2. Admin role → /admin
 *  3. Seller-side DB roles → /supplier
 *  4. Buyer / unknown → /marketplace
 *
 * The onboarding gate on /_authenticated will still redirect to /onboarding
 * when the profile is incomplete.
 */
export async function resolvePostLoginPath(userId: string): Promise<string> {
  const mode = getSessionMode();
  if (mode === "seller") return "/supplier";
  if (mode === "buyer") return "/marketplace";

  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as string);
    if (roles.includes("admin")) return "/admin";
    if (roles.some((r) => ["manufacturer", "wholesaler", "distributor"].includes(r))) {
      return "/supplier";
    }
    return "/marketplace";
  } catch {
    return "/marketplace";
  }
}
