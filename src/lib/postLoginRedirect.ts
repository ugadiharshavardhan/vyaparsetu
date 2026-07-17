import { getSessionMode } from "@/lib/sessionMode";
import { getUserRole } from "@/lib/rbac";
import { peekPendingCartAdd } from "@/lib/pendingCart";

/**
 * Resolve where a user should land after a successful auth event.
 *
 * Priority:
 *  1. Explicit `redirect` search param (e.g. Add-to-cart return URL)
 *  2. Pending cart add `returnTo` (guest clicked Add before sign-in)
 *  3. Session mode / role defaults (seller → dashboard, buyer → marketplace, admin → /admin)
 */
export async function resolvePostLoginPath(
  userId: string,
  explicitRedirect?: string | null,
): Promise<string> {
  const mode = getSessionMode();
  // A buyer-mode sign-in must never be sent into the seller workspace, even if a
  // stale `redirect`/pending-cart path points at /supplier/* or /seller/*.
  const preferBuyer = mode === "buyer";
  const allow = (path: string | null): path is string =>
    !!path && !(preferBuyer && isSellerWorkspacePath(path));

  const fromQuery = sanitizeReturnPath(explicitRedirect);
  if (allow(fromQuery)) return fromQuery;

  const pendingReturn = sanitizeReturnPath(peekPendingCartAdd()?.returnTo);
  if (allow(pendingReturn)) return pendingReturn;

  if (mode === "seller") return "/seller/dashboard";
  if (mode === "buyer") return "/marketplace";

  try {
    const role = await getUserRole(userId);
    if (role === "admin") return "/admin";
    if (role === "seller") return "/seller/dashboard";
    return "/marketplace";
  } catch {
    return "/marketplace";
  }
}

/** Seller-only workspace routes buyers should never land on. */
export function isSellerWorkspacePath(path: string): boolean {
  return path.startsWith("/supplier") || path.startsWith("/seller");
}

/** Only allow same-origin relative paths (block open redirects). */
export function sanitizeReturnPath(path?: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/auth") || trimmed.startsWith("/forgot-password") || trimmed.startsWith("/reset-password")) {
    return null;
  }
  return trimmed;
}
