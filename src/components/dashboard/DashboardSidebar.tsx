import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Bell, Boxes, Building2, FileText, HelpCircle, Heart, LayoutDashboard, LifeBuoy,
  LineChart, LogOut, MapPin, Megaphone, Package, PackageOpen, ReceiptText,
  Settings, ShieldCheck, ShoppingBag, ShoppingCart, Star, Store, Tag, User, Users, Warehouse,
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
import { useRoles } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

// Buyer sidebar — simplified for Phase 8. Hidden routes (Wishlist, Suppliers,
// Addresses, Help, Settings) remain reachable directly by URL.
const MAIN = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "Orders", url: "/orders", icon: Package },
  { title: "Cart", url: "/cart", icon: ShoppingCart },
  { title: "Payments", url: "/payments", icon: ReceiptText },
  { title: "Profile", url: "/profile", icon: User },
] as const;

const ACCOUNT: readonly { title: string; url: string; icon: typeof Store }[] = [];

// Seller sidebar — simplified for Phase 8. Customers, Warehouse, Pricing,
// Promotions, Reviews, Business profile, Documents, Notifications, Analytics,
// Support routes remain reachable directly by URL.
const SUPPLIER = [
  { title: "Dashboard", url: "/supplier", icon: LayoutDashboard },
  { title: "Products", url: "/supplier/products", icon: PackageOpen },
  { title: "Orders", url: "/supplier/orders", icon: ReceiptText },
  { title: "Inventory", url: "/supplier/inventory", icon: Boxes },
  { title: "Dispatch", url: "/supplier/dispatch", icon: Warehouse },
  { title: "Payments", url: "/supplier/payments", icon: ReceiptText },
  { title: "Settings", url: "/supplier/settings", icon: Settings },
] as const;

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: roles } = useRoles();
  const isAdmin = roles?.includes("admin");
  const isSupplier = !!roles?.some((r) => r === "wholesaler" || r === "manufacturer" || r === "distributor");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const cartCount = cart?.filter((c) => !c.saved_for_later).length ?? 0;
  const wishCount = wishlist?.length ?? 0;

  const badgeFor = (url: string): number => {
    if (url === "/cart") return cartCount;
    if (url === "/wishlist") return wishCount;
    return 0;
  };

  const isActive = (url: string) => pathname === url || (url !== "/dashboard" && pathname.startsWith(url));

  const signOut = async () => {
    try {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
    } catch {
      toast.error("Could not sign out");
    }
  };

  const renderItems = (items: readonly { title: string; url: string; icon: typeof Store }[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const count = badgeFor(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={collapsed ? item.title : undefined}>
              <Link to={item.url} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.title}</span>}
                {!collapsed && count > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
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
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex h-12 items-center gap-2 px-2">
          <Logo compact={collapsed} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>{renderItems(MAIN)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Account</SidebarGroupLabel>}
          <SidebarGroupContent>{renderItems(ACCOUNT)}</SidebarGroupContent>
        </SidebarGroup>

        {isSupplier && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Seller workspace</SidebarGroupLabel>}
            <SidebarGroupContent>{renderItems(SUPPLIER)}</SidebarGroupContent>
          </SidebarGroup>
        )}

        {isSupplier && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>More tools</SidebarGroupLabel>}
            <SidebarGroupContent>{renderItems(SUPPLIER_MORE)}</SidebarGroupContent>
          </SidebarGroup>
        )}



        {isAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
            <SidebarGroupContent>{renderItems(ADMIN)}</SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip={collapsed ? "Sign out" : undefined}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
