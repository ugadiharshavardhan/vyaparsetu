import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve where a user should land after a successful auth event.
 * - admin  → /admin
 * - manufacturer / wholesaler / distributor (seller-side) → /supplier
 * - retailer (buyer-side) or unknown → /dashboard
 * Onboarding gate on /_authenticated will still redirect to /onboarding
 * when the profile is incomplete.
 */
export async function resolvePostLoginPath(userId: string): Promise<string> {
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
    return "/dashboard";
  } catch {
    return "/dashboard";
  }
}
