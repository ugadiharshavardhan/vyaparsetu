import { useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartButton } from "@/components/cart/CartButton";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { useSessionMode } from "@/hooks/useSessionMode";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { useProfile } from "@/hooks/useProfile";

export function DashboardTopbar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const sessionMode = useSessionMode();
  const { data: account } = useAccountFlags();

  const isSellerWorkspace =
    sessionMode === "seller" ||
    (sessionMode !== "buyer" && !!account?.isSeller);

  // On seller routes, show the workspace-oriented header
  const isSellerRoute =
    pathname.startsWith("/seller") || pathname.startsWith("/supplier");

  const showSellerHeader = isSellerWorkspace && isSellerRoute;

  if (showSellerHeader) {
    return <SellerTopbar />;
  }

  // Default buyer/shared dashboard topbar
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger />

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products, orders, suppliers…" className="h-9 w-72 pl-9" />
        </div>

        <CartButton variant="ghost" />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Seller-specific topbar — clean, workspace-oriented, no marketplace chrome
 * ──────────────────────────────────────────────────────────────────────────── */

function SellerTopbar() {
  const { data: profile } = useProfile();

  // Derive a short workspace label from business name
  const workspaceLabel =
    profile?.business_name?.split(/\s+/).slice(0, 3).join(" ") || "Seller Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/60 bg-card/80 backdrop-blur-md">
      {/* Left: sidebar trigger + workspace context */}
      <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground" />

        {/* Thin vertical divider */}
        <div className="hidden h-5 w-px bg-border/60 sm:block" />

        {/* Workspace title — subtle, non-dominant */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[13px] font-semibold tracking-tight text-foreground/85">
            {workspaceLabel}
          </span>
          <span className="rounded-md bg-brand/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            Seller
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-1.5 px-3 sm:gap-2.5 sm:px-5">
        <NotificationsMenu />

        {/* Thin vertical divider before profile */}
        <div className="hidden h-5 w-px bg-border/60 sm:block" />

        <UserMenu />
      </div>
    </header>
  );
}
