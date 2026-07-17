import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  FlaskConical,
  Heart,
  Loader2,
  LocateFixed,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartButton } from "@/components/cart/CartButton";
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
import { useDeliveryLocation } from "@/hooks/useDeliveryLocation";
import { DELIVERY_LOCATIONS } from "@/lib/deliveryLocation";
import { useBuyerNotifications, formatRelativeTime } from "@/hooks/useBuyerNotifications";
import { usePendingSampleRequestCount } from "@/hooks/useSampleRequests";

export function DashboardTopbar({ isBuyerLayout = false }: { isBuyerLayout?: boolean }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // Select the `q` value as a primitive string. Selecting the whole `search`
  // object returns a new reference on every router tick, which made the sync
  // effect below fire constantly and wipe out what the user was typing.
  const urlQuery = useRouterState({
    select: (r) => ((r.location.search as Record<string, unknown>)?.q as string | undefined) ?? "",
  });
  const sessionMode = useSessionMode();
  const { data: account } = useAccountFlags();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchVal, setSearchVal] = useState(urlQuery);
  const { location, detecting, select: selectLocation, detect: detectLocation } = useDeliveryLocation();
  const {
    notifications,
    unreadCount: unread,
    markAllSeen,
    isUnread,
  } = useBuyerNotifications();
  const pendingRequestCount = usePendingSampleRequestCount();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const debouncedSearchVal = useDebounce(searchVal, 200);

  // Reflect the URL's `q` in the input (back/forward, clear, cross-page search),
  // but never while the user is actively typing so keystrokes aren't clobbered.
  useEffect(() => {
    if (searchInputRef.current && document.activeElement === searchInputRef.current) return;
    setSearchVal(urlQuery);
  }, [urlQuery]);

  // Live-filter while on the marketplace; guard against redundant navigations
  // (which would otherwise re-fire and interfere with unrelated transitions).
  useEffect(() => {
    if (pathname !== "/marketplace") return;
    const nextQ = debouncedSearchVal.trim() || undefined;
    if ((nextQ ?? "") === urlQuery) return;
    void navigate({
      to: "/marketplace",
      search: (prev: any) => ({ ...prev, q: nextQ }),
      replace: true,
    });
  }, [debouncedSearchVal, urlQuery, navigate, pathname]);

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
      <header className="sticky top-0 z-30 grid h-14 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-card px-3 shadow-sm transition-all sm:h-16 sm:gap-4 sm:px-4 xl:gap-6 xl:px-6">
        {/* Left: menu, logo, location */}
        <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full lg:hidden" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[280px] flex-col justify-between bg-card p-0">
              <div>
                <div className="flex h-16 items-center border-b px-6">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  <Link to="/marketplace" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    Marketplace
                  </Link>
                  <Link to="/orders" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    My Orders
                  </Link>
                  <Link to="/wishlist" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Saved Items
                  </Link>
                  <Link to="/samples" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    Samples
                  </Link>
                  <Link to="/requests" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    Requests
                    {pendingRequestCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                        {pendingRequestCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <Link to="/settings" activeProps={{ className: "text-brand bg-brand-soft/20" }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary">
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

          <Logo className="hidden shrink-0 sm:inline-flex" imgClassName="h-9 sm:h-11" />
          <Logo compact className="inline-flex shrink-0 sm:hidden" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden shrink-0 cursor-pointer flex-col text-left transition-opacity hover:opacity-80 focus:outline-none md:flex">
                <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-muted-foreground">Deliver to</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-foreground">
                  {detecting ? "Detecting…" : location ?? "Select Location"}
                  <span className="ml-0.5 text-[9px] text-brand">▼</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Delivery Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => void detectLocation()}
                disabled={detecting}
              >
                {detecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="mr-2 h-4 w-4 text-brand" />
                )}
                Use my current location
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {location &&
                !DELIVERY_LOCATIONS.includes(location as (typeof DELIVERY_LOCATIONS)[number]) && (
                  <DropdownMenuItem
                    className="cursor-pointer font-semibold text-brand"
                    onClick={() => selectLocation(location)}
                  >
                    {location}
                  </DropdownMenuItem>
                )}
              {DELIVERY_LOCATIONS.map((city) => (
                <DropdownMenuItem
                  key={city}
                  className="cursor-pointer"
                  onClick={() => selectLocation(city)}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: primary nav */}
        <nav className="hidden items-center gap-0.5 justify-self-center lg:flex xl:gap-1">
          <Link
            to="/marketplace"
            activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5"
          >
            Marketplace
          </Link>
          <Link
            to="/orders"
            activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5"
          >
            Orders
          </Link>
          <Link
            to="/wishlist"
            activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5"
          >
            Saved
          </Link>
          <Link
            to="/samples"
            activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5"
          >
            Samples
          </Link>
          <Link
            to="/requests"
            activeProps={{ className: "text-brand bg-brand-soft/30 font-semibold" }}
            className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5"
          >
            Requests
            {pendingRequestCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
                {pendingRequestCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right: search, cart, notifications, profile */}
        <div className="flex min-w-0 items-center gap-1.5 justify-self-end sm:gap-3">
          <div className="relative hidden min-w-0 w-[10rem] sm:block md:w-[12rem] lg:w-[11rem] xl:w-[14rem] 2xl:w-[17rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate({
                    to: "/marketplace",
                    search: (prev: any) => ({ ...prev, q: searchVal.trim() || undefined }),
                  });
                }
              }}
              placeholder="Search products..."
              className="h-9 w-full rounded-xl border border-border bg-muted/20 py-2 pl-9 pr-9 text-sm shadow-none hover:bg-muted/30 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand lg:h-10"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full sm:hidden"
            aria-label="Search"
            onClick={() => navigate({ to: "/marketplace" })}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Heart shortcut duplicates the center "Saved" link — show it only when
              the center nav is hidden (< lg) or when there's plenty of room (2xl+). */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-full hover:bg-muted sm:inline-flex lg:hidden 2xl:inline-flex"
            aria-label="Saved items"
          >
            <Link to="/wishlist" activeProps={{ className: "text-brand" }}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <CartButton variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted" />

          <Popover onOpenChange={(open) => open && markAllSeen()}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted" aria-label="Notifications">
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
                  <div className="text-xs text-muted-foreground">
                    {unread > 0 ? `${unread} new` : "You're all caught up"}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/notifications">See all</Link>
                </Button>
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet. Place an order or add items to your cart to see updates here.
                </div>
              ) : (
                <ul className="max-h-80 divide-y overflow-y-auto">
                  {notifications.slice(0, 6).map((n) => (
                    <li key={n.id} className="p-0 hover:bg-muted/50">
                      <Link to={n.link} className="flex gap-3 p-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                          <n.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{n.title}</div>
                          <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatRelativeTime(n.timestamp)}
                          </div>
                        </div>
                        {isUnread(n) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
    <header className="sticky top-0 z-30 flex h-[4.75rem] items-center border-b border-border/60 bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground" />

        <div className="hidden h-5 w-px bg-border/60 sm:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-semibold tracking-tight text-foreground/85">
            {workspaceLabel}
          </span>
          <span className="rounded-md bg-brand/8 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
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
