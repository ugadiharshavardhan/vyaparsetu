import { supabase } from "@/integrations/supabase/client";
import { getSessionMode } from "@/lib/sessionMode";
import { getUserRole } from "@/lib/rbac";

/**
 * Resolve where a user should land after a successful auth event.
 *
 * Priority:
 *  1. Session mode chosen at sign-in (buyer → /buyer/dashboard, seller → /seller/dashboard)
 *  2. Admin table → /admin/dashboard
 *  3. Sellers table → /seller/dashboard
 *  4. Buyers / unknown → /buyer/dashboard
 */
export async function resolvePostLoginPath(userId: string): Promise<string> {
  const mode = getSessionMode();
  if (mode === "seller") return "/marketplace";
  if (mode === "buyer") return "/buyer/dashboard";

  try {
    const role = await getUserRole(userId);
    if (role === "admin") return "/admin";
    if (role === "seller") return "/marketplace";
    return "/buyer/dashboard";
  } catch {
    return "/buyer/dashboard";
  }
}
