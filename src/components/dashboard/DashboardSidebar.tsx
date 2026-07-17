import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Bell, Boxes, FileText, Heart, Info, LayoutDashboard, LifeBuoy,
  LineChart, LogOut, Mail, Megaphone, Package, PackageOpen, ReceiptText,
  Settings, ShieldCheck, ShoppingCart, Store, Tag, User, Users, Warehouse, FileQuestion
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/Logo";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { supabase } from "@/integrations/supabase/client";
import { useCartCount } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useSessionMode } from "@/hooks/useSessionMode";
import { useHomeDestination } from "@/hooks/useHomeDestination";
import { clearSessionMode } from "@/lib/sessionMode";
import { cn } from "@/lib/utils";

// Buyer sidebar — Phase 8 simplified. Wishlist, Suppliers, Addresses, Help,
// Settings remain reachable directly by URL (routes preserved, nav hidden).
const MAIN = [
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "Suppliers", url: "/suppliers", icon: Users },
  { title: "Cart", url: "/cart", icon: ShoppingCart },
  { title: "Saved items", url: "/wishlist", icon: Heart },
] as const;

const ACCOUNT = [
  { title: "Profile", url: "/profile", icon: User },
] as const;

const EXPLORE = [
  { title: "About", url: "/about", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
] as const;

// Seller sidebar — Phase 8 simplified. Customers, Warehouse, Pricing,
// Promotions, Reviews, Business profile, Documents, Notifications, Analytics,
// Support routes remain reachable directly by URL (nav hidden).
const SUPPLIER = [
  { title: "Dashboard", url: "/seller/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/supplier/products", icon: PackageOpen },
  { title: "Orders", url: "/supplier/orders", icon: ReceiptText },
  { title: "Buyers", url: "/supplier/customers", icon: Users },
  { title: "Inventory", url: "/supplier/inventory", icon: Boxes },
  { title: "Payments", url: "/supplier/payments", icon: ReceiptText },
  { title: "Analytics", url: "/supplier/analytics", icon: BarChart3 },
  { title: "Reports", url: "/supplier/reports", icon: FileText },
  { title: "Settings", url: "/supplier/settings", icon: Settings },
] as const;

const ADMIN = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Verifications", url: "/admin/verifications", icon: ShieldCheck },
  { title: "Products", url: "/admin/products", icon: Boxes },
  { title: "Categories", url: "/admin/categories", icon: Tag },
  { title: "Orders", url: "/admin/orders", icon: Package },
  { title: "Payments", url: "/admin/payments", icon: ReceiptText },
  { title: "Finance", url: "/admin/finance", icon: LineChart },
  { title: "Support", url: "/admin/support", icon: LifeBuoy },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Banners", url: "/admin/banners", icon: Megaphone },
  { title: "CMS", url: "/admin/cms", icon: FileText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Roles", url: "/admin/roles", icon: ShieldCheck },
  { title: "Audit logs", url: "/admin/audit", icon: FileText },
  { title: "Security", url: "/admin/security", icon: ShieldCheck },
  { title: "Settings", url: "/admin/settings", icon: Settings },
] as const;

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: account } = useAccountFlags();
  const sessionMode = useSessionMode();
  const homeTo = useHomeDestination();
  // Admin nav only on /admin routes — never mix into buyer/seller workspaces.
  const isAdminRoute = pathname.startsWith("/admin");
  const showAdminNav = isAdminRoute && !!account?.isAdmin;
  // Session mode (chosen at sign-in) wins so a customer sign-in shows buyer nav.
  const isSupplier =
    !showAdminNav &&
    (sessionMode === "seller" || (sessionMode !== "buyer" && !!account?.isSeller));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cartCount = useCartCount();
  const { data: wishlist } = useWishlist();
  const wishCount = wishlist?.length ?? 0;

  const badgeFor = (url: string): number => {
    if (url === "/cart") return cartCount;
    if (url === "/wishlist") return wishCount;
    return 0;
  };

  const isActive = (url: string) => pathname === url || (url !== "/marketplace" && url !== "/seller/dashboard" && pathname.startsWith(url));

  const signOut = async () => {
    try {
      await qc.cancelQueries();
      qc.clear();
      clearSessionMode();
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
    } catch {
      toast.error("Could not sign out");
    }
  };

  const renderItems = (items: readonly { title: string; url: string; icon: typeof Store }[]) => (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const count = badgeFor(item.url);
        const active = isActive(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={collapsed ? item.title : undefined}
              className={cn(
                "group/nav-item relative h-9 rounded-lg px-3 transition-all duration-150 ease-out",
                active
                  ? "bg-brand/10 text-brand font-medium shadow-[inset_3px_0_0_0_var(--color-brand)] dark:bg-brand/15"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              )}
            >
              <Link to={item.url} className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                  active ? "text-brand" : "text-sidebar-foreground/50 group-hover/nav-item:text-sidebar-foreground/80"
                )} />
                {!collapsed && (
                  <span className={cn(
                    "flex-1 text-[13px] leading-none tracking-[-0.01em]",
                    active ? "font-semibold" : "font-medium"
                  )}>
                    {item.title}
                  </span>
                )}
                {!collapsed && count > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm">
                    {count}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      {/* Header — logo area with refined border */}
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-2.5">
        <Link
          to={homeTo}
          className={cn(
            "flex h-16 items-center rounded-lg transition-colors duration-150 hover:bg-sidebar-accent/50",
            collapsed ? "justify-center px-0" : "gap-2.5 px-1.5"
          )}
        >
          <Logo
            asLink={false}
            compact={collapsed}
            hideSubtitle
            imgClassName={collapsed ? undefined : "h-16"}
          />
        </Link>
      </SidebarHeader>

      {/* Main scrollable content */}
      <SidebarContent className="px-1.5 py-2">
        {showAdminNav ? (
          <SidebarGroup className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>{renderItems(ADMIN)}</SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {!isSupplier && (
              <SidebarGroup className="py-1">
                {!collapsed && (
                  <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                    Workspace
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>{renderItems(MAIN)}</SidebarGroupContent>
              </SidebarGroup>
            )}

            {!isSupplier && (
              <SidebarGroup className="py-1">
                {!collapsed && (
                  <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                    Explore
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>{renderItems(EXPLORE)}</SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSupplier && (
              <SidebarGroup className="py-1">
                {!collapsed && (
                  <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                    Seller workspace
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>{renderItems(SUPPLIER)}</SidebarGroupContent>
              </SidebarGroup>
            )}

            {isSupplier && (
              <SidebarGroup className="py-1">
                {!collapsed && (
                  <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                    Account
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>{renderItems(ACCOUNT)}</SidebarGroupContent>
              </SidebarGroup>
            )}

            {!isSupplier && (
              <SidebarGroup className="py-1">
                {!collapsed && (
                  <SidebarGroupLabel className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
                    Account
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  {renderItems([{ title: "Profile", url: "/profile", icon: User }] as const)}
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      {/* Footer — sign out with refined styling */}
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip={collapsed ? "Sign out" : undefined}
              className="h-9 rounded-lg px-3 text-sidebar-foreground/60 transition-all duration-150 hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="text-[13px] font-medium tracking-[-0.01em]">Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
