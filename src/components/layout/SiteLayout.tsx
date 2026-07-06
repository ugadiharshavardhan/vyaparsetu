import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

// Routes that use the dashboard shell (sidebar + topbar). We hide the marketing
// site chrome for these paths and let the dashboard layout render its own.
const APP_PREFIXES = [
  "/dashboard", "/profile", "/settings", "/orders", "/cart", "/wishlist",
  "/admin", "/notifications", "/help", "/onboarding",
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isApp) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
