import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartButton } from "@/components/cart/CartButton";
import { DEMO_NOTIFICATIONS } from "@/data/dashboard";
import { Logo } from "@/components/common/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { clearSessionMode } from "@/lib/sessionMode";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { useSessionMode } from "@/hooks/useSessionMode";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { useProfile } from "@/hooks/useProfile";

export function DashboardTopbar({ isBuyerLayout = false }: { isBuyerLayout?: boolean }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const searchParams = useRouterState({ select: (r) => r.location.search });
  const sessionMode = useSessionMode();
  const { data: account } = useAccountFlags();

  const [searchVal, setSearchVal] = useState((searchParams as Record<string, any>)?.q ?? "");
  const [selectedLocation, setSelectedLocation] = useState("Bengaluru, KA");
  const unread = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const debouncedSearchVal = useDebounce(searchVal, 200);

  useEffect(() => {
    setSearchVal((searchParams as Record<string, any>)?.q ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (pathname === "/marketplace") {
      void navigate({
        to: "/marketplace",
        search: (prev: any) => ({ ...prev, q: debouncedSearchVal || undefined }),
        replace: true,
      });
    }
  }, [debouncedSearchVal, navigate, pathname]);

  const handleSignOut = async () => {
    try {
      await qc.cancelQueries();
      qc.clear();
      clearSessionMode();
      await supabase.auth.signOut();
      toast.success("You've been signed out");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("Could not sign out");
    }
  };

  if (isBuyerLayout) {
    return (
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card px-3 shadow-sm transition-all sm:h-16 sm:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full lg:hidden" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[280px] flex-col justify-between bg-card p-0">
              <div>
                <div className="flex h-16 items-center border-b px-6">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  <Link to="/marketplace" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    Marketplace
                  </Link>
                  <Link to="/orders" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    My Orders
                  </Link>
                  <Link to="/wishlist" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Saved Items
                  </Link>
                  <Link to="/profile" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <Link to="/settings" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                </nav>
              </div>
              <div className="border-t bg-muted/20 p-4">
                <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Logo className="hidden shrink-0 sm:inline-flex" />
          <Logo compact className="inline-flex shrink-0 sm:hidden" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 hidden shrink-0 cursor-pointer flex-col text-left transition-opacity hover:opacity-80 focus:outline-none md:flex">
                <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-muted-foreground">Deliver to</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-foreground">
                  {selectedLocation} <span className="ml-0.5 text-[9px] text-brand">▼</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Delivery Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLocation("Bengaluru, KA")}>Bengaluru, Karnataka</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLocation("Mumbai, MH")}>Mumbai, Maharashtra</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLocation("Delhi NCR")}>Delhi NCR</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLocation("Chennai, TN")}>Chennai, Tamil Nadu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative mx-2 max-w-xl flex-1 sm:mx-4 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({
                  to: "/marketplace",
                  search: (prev: any) => ({ ...prev, q: searchVal || undefined }),
                });
              }
            }}
            placeholder="Search products, brands, categories..."
            className="h-10 w-full rounded-xl border border-border bg-muted/20 py-2 pl-10 pr-10 shadow-none hover:bg-muted/30 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal("");
                navigate({
                  to: "/marketplace",
                  search: (prev: any) => ({ ...prev, q: undefined }),
                });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <nav className="mr-2 hidden items-center gap-1 lg:flex">
            <Link to="/marketplace" activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Marketplace
            </Link>
            <Link to="/orders" activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Orders
            </Link>
          </nav>

          <CartButton variant="ghost" className="h-10 w-10 rounded-full hover:bg-muted" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-xl border-border p-0 shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <div className="font-semibold">Notifications</div>
                  <div className="text-xs text-muted-foreground">{unread} unread</div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/notifications">See all</Link>
                </Button>
              </div>
              <ul className="max-h-80 divide-y overflow-y-auto">
                {DEMO_NOTIFICATIONS.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex gap-3 p-3 hover:bg-muted/50">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{n.title}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</div>
                    </div>
                    {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <UserMenu />
        </div>
      </header>
    );
  }

  const isSellerWorkspace =
    sessionMode === "seller" ||
    (sessionMode !== "buyer" && !!account?.isSeller);

  const isSellerRoute =
    pathname.startsWith("/seller") || pathname.startsWith("/supplier");

  if (isSellerWorkspace && isSellerRoute) {
    return <SellerTopbar />;
  }

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

function SellerTopbar() {
  const { data: profile } = useProfile();

  const workspaceLabel =
    profile?.business_name?.split(/\s+/).slice(0, 3).join(" ") || "Seller Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground" />

        <div className="hidden h-5 w-px bg-border/60 sm:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[13px] font-semibold tracking-tight text-foreground/85">
            {workspaceLabel}
          </span>
          <span className="rounded-md bg-brand/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            Seller
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 px-3 sm:gap-2.5 sm:px-5">
        <NotificationsMenu />

        <div className="hidden h-5 w-px bg-border/60 sm:block" />

        <UserMenu />
      </div>
    </header>
  );
}
