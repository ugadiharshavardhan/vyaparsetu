import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2, LocateFixed, MapPin, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/common/Logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryLocation } from "@/hooks/useDeliveryLocation";
import { DELIVERY_LOCATIONS } from "@/lib/deliveryLocation";

const LANDING_NAV = [
  { label: "Browse catalogue", to: "/marketplace" as const, badge: "NEW" as const },
  { label: "Quality", to: "/" as const, hash: "quality" },
  { label: "Sustainability", to: "/" as const, hash: "sustainability" },
  { label: "Blogs", to: "/about" as const },
] as const;

function LocationPicker({
  location,
  detecting,
  onSelect,
  onDetect,
  className,
}: {
  location: string | null;
  detecting?: boolean;
  onSelect: (city: string) => void;
  onDetect?: () => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            className ??
            "flex shrink-0 items-start gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-secondary"
          }
        >
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <span className="min-w-0">
            <span className="block text-sm leading-none text-muted-foreground">Delivery in</span>
            <span className="mt-1.5 flex items-center gap-1 text-lg font-semibold leading-none text-foreground">
              {detecting ? "Detecting…" : location ?? "Select Location"}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {onDetect && (
          <>
            <DropdownMenuItem onClick={onDetect} disabled={detecting}>
              {detecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4 text-brand" />
              )}
              Use my current location
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {location && !DELIVERY_LOCATIONS.includes(location as (typeof DELIVERY_LOCATIONS)[number]) && (
          <DropdownMenuItem onClick={() => onSelect(location)} className="font-semibold text-brand">
            {location}
          </DropdownMenuItem>
        )}
        {DELIVERY_LOCATIONS.map((city) => (
          <DropdownMenuItem key={city} onClick={() => onSelect(city)}>
            {city}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { location, detecting, select: selectLocation, detect: detectLocation } = useDeliveryLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Landing "Login / Signup": a signed-in user goes straight to the marketplace,
  // but only once auth has actually hydrated. While `loading`, `isAuthenticated`
  // is still `false` for a genuinely signed-in user, so we route through `/auth`
  // and let its `beforeLoad` send them to the right place. Guests get the buyer
  // sign-in / sign-up screen. This keeps the button 100% deterministic.
  const goLoginOrDashboard = () => {
    if (!authLoading && isAuthenticated) {
      void navigate({ to: "/marketplace" });
      return;
    }
    void navigate({ to: "/auth", search: { mode: "signin", role: "buyer" } });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border/70 transition-colors ${
        scrolled ? "bg-card/95 backdrop-blur-sm" : "bg-card"
      }`}
    >
      <div className="mx-auto flex h-[5.25rem] w-full max-w-[100rem] items-center gap-3 px-4 sm:h-[5.75rem] sm:px-6 lg:gap-5 lg:px-10 xl:px-12">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
          <Logo className="shrink-0" imgClassName="h-14 sm:h-16" />
          <div className="hidden sm:block">
            <LocationPicker
              location={location}
              detecting={detecting}
              onSelect={selectLocation}
              onDetect={detectLocation}
            />
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
          {LANDING_NAV.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-base font-semibold text-foreground/85 transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5 xl:text-lg"
            >
              {l.label}
              {"badge" in l && l.badge ? (
                <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-foreground">
                  {l.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3.5 lg:ml-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-12 items-center gap-2.5 rounded-full border border-border bg-secondary/70 px-5 text-base text-muted-foreground transition hover:border-brand/30 hover:bg-secondary md:inline-flex lg:w-[200px] xl:w-[280px]"
            aria-label="Search items or categories"
          >
            <Search className="h-5 w-5 shrink-0 text-brand" />
            <span className="truncate">Search items or categories</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-muted-foreground md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-brand" />
          </button>

          <Button
            className="hidden h-12 rounded-full bg-brand px-7 text-base font-semibold text-brand-foreground hover:bg-brand/90 sm:inline-flex"
            onClick={goLoginOrDashboard}
          >
            Login / Signup
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm p-0">
              <div className="flex items-center justify-between border-b border-border p-5">
                <Logo />
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetTrigger>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <div className="mb-2 sm:hidden">
                  <LocationPicker
                    location={location}
                    detecting={detecting}
                    onSelect={selectLocation}
                    onDetect={detectLocation}
                    className="flex w-full items-center gap-2 rounded-lg border border-border px-4 py-3 text-left"
                  />
                </div>

                {LANDING_NAV.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    hash={"hash" in l ? l.hash : undefined}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-foreground hover:bg-secondary"
                  >
                    {l.label}
                    {"badge" in l && l.badge ? (
                      <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-foreground">
                        {l.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}

                <div className="mt-4 border-t border-border pt-4">
                  <Button
                    className="h-11 w-full rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
                    onClick={goLoginOrDashboard}
                  >
                    Login / Signup
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
