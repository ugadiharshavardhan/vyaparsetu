import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3, Boxes, FileText, HelpCircle, Heart, LayoutDashboard, LogOut, MapPin,
  Package, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Store, Tag, User, Users,
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

const MAIN = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "Orders", url: "/orders", icon: Package },
  { title: "Wishlist", url: "/wishlist", icon: Heart },
  { title: "Cart", url: "/cart", icon: ShoppingCart },
  { title: "Addresses", url: "/addresses", icon: MapPin },
  { title: "Suppliers", url: "/suppliers", icon: ShoppingBag },
] as const;

const ACCOUNT = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
] as const;

const ADMIN = [
  { title: "Users", url: "/admin", icon: Users },
  { title: "Products", url: "/admin", icon: Boxes },
  { title: "Categories", url: "/admin", icon: Tag },
  { title: "Analytics", url: "/admin", icon: BarChart3 },
  { title: "Reports", url: "/admin", icon: FileText },
] as const;

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: roles } = useRoles();
  const isAdmin = roles?.includes("admin");
  const navigate = useNavigate();
  const qc = useQueryClient();

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
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={collapsed ? item.title : undefined}>
            <Link to={item.url} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
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

        {isAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")} tooltip={collapsed ? "Admin" : undefined}>
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {!collapsed && <span>Admin console</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {ADMIN.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <Link to={item.url} className="flex items-center gap-2 text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
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
