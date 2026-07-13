import type { ReactNode } from "react";
import { useContext } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AuthContext } from "@/hooks/useAuth";

// Routes that always use the dashboard shell (sidebar + topbar). We hide the
// marketing site chrome for these paths and let the dashboard layout render
// its own chrome.
const APP_PREFIXES = [
  "/dashboard", "/profile", "/settings", "/orders", "/cart", "/wishlist",
  "/admin", "/notifications", "/help", "/onboarding", "/payments",
  "/addresses", "/checkout", "/supplier",
];

// Public routes that should adopt the dashboard shell when the visitor is
// signed in — e.g. Marketplace is exposed both as a public landing surface
// and as a workspace destination from the buyer sidebar.
const SHARED_PREFIXES = ["/marketplace", "/suppliers", "/products", "/categories"];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // Read AuthContext directly so this layout still works when rendered by the
  // root route's error/notFound boundaries (which mount outside AuthProvider).
  const auth = useContext(AuthContext);
  const isAuthenticated = !!auth?.isAuthenticated;

  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isShared = SHARED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));


  if (isApp) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  if (isShared && isAuthenticated) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
