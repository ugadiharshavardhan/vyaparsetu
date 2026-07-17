import { useAuth } from "@/hooks/useAuth";
import { useSessionMode } from "@/hooks/useSessionMode";
import { useAccountFlags } from "@/hooks/useAccountFlags";

/**
 * Resolves where the brand logo / "home" should point based on auth state:
 *  - Guests (not signed in)      → landing page `/`
 *  - Signed-in sellers           → `/seller/dashboard`
 *  - Signed-in buyers (default)  → `/marketplace`
 *
 * The marketing landing page is therefore only reachable via the logo when the
 * user is logged out.
 */
export function useHomeDestination(): string {
  const { isAuthenticated } = useAuth();
  const sessionMode = useSessionMode();
  const { data: account } = useAccountFlags();

  if (!isAuthenticated) return "/";

  const isSeller =
    sessionMode === "seller" || (sessionMode !== "buyer" && !!account?.isSeller);

  return isSeller ? "/seller/dashboard" : "/marketplace";
}
