import type { ReactNode } from "react";
import { useContext, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CartSheet } from "@/components/cart/CartSheet";
import { LoadingOverlay } from "@/components/common/LoadingSpinner";
import { AuthContext } from "@/hooks/useAuth";

// Routes that always use the dashboard shell (sidebar + topbar). We hide the
// marketing site chrome for these paths and let the dashboard layout render
// its own chrome.
const APP_PREFIXES = [
  "/dashboard", "/buyer/dashboard", "/seller/dashboard", "/profile", "/settings", "/orders", "/wishlist",
  "/admin", "/notifications", "/help", "/onboarding", "/payments",
  "/addresses", "/supplier",
];

/** Full-bleed auth chrome (no marketing header/footer). */
const AUTH_PREFIXES = ["/auth", "/forgot-password", "/reset-password"];

// Public routes that should adopt the dashboard shell when the visitor is
// signed in — e.g. Marketplace is exposed both as a public landing surface
// and as a workspace destination from the buyer sidebar.
const SHARED_PREFIXES = ["/marketplace", "/suppliers", "/products", "/categories", "/about", "/contact", "/cart"];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const hash = useRouterState({ select: (r) => r.location.hash });
  const isNavigating = useRouterState({
    select: (r) => Boolean(r.isLoading),
  });
  // Read AuthContext directly so this layout still works when rendered by the
  // root route's error/notFound boundaries (which mount outside AuthProvider).
  const auth = useContext(AuthContext);
  const isAuthenticated = !!auth?.isAuthenticated;

  // Always land at the top of the destination page (hash links keep section scroll).
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuth = AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isShared = SHARED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const chrome = (
    <>
      <LoadingOverlay show={isNavigating} label="Loading page…" />
      <CartSheet />
    </>
  );

  if (isApp || isAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
        {chrome}
      </div>
    );
  }

  if (isShared && isAuthenticated) {
    return (
      <DashboardLayout>
        {children}
        {chrome}
      </DashboardLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {chrome}
    </div>
  );
}
