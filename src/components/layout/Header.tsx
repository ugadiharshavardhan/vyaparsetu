import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/common/Logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useAuth } from "@/hooks/useAuth";
import {
  DELIVERY_LOCATIONS,
  readDeliveryLocation,
  writeDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/deliveryLocation";

const LANDING_NAV = [
  { label: "Browse catalogue", to: "/marketplace" as const, badge: "NEW" as const },
  { label: "Quality", to: "/" as const, hash: "quality" },
  { label: "Sustainability", to: "/" as const, hash: "sustainability" },
  { label: "Blogs", to: "/about" as const },
] as const;

function LocationPicker({
  location,
  onSelect,
  className,
}: {
  location: DeliveryLocation | null;
  onSelect: (city: DeliveryLocation) => void;
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
            <span className="block text-xs leading-none text-muted-foreground">Delivery in</span>
            <span className="mt-1.5 flex items-center gap-1 text-base font-semibold leading-none text-foreground">
              {location ?? "Select Location"}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
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
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Landing "Login / Signup": signed-in users go straight to their dashboard
  // (marketplace); guests get the buyer sign-in / sign-up screen.
  const goLoginOrDashboard = () => {
    if (isAuthenticated) {
      void navigate({ to: "/marketplace" });
      return;
    }
    void navigate({ to: "/auth", search: { mode: "signin", role: "buyer" } });
  };

  useEffect(() => {
    setLocation(readDeliveryLocation());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectLocation = (city: DeliveryLocation) => {
    setLocation(city);
    writeDeliveryLocation(city);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border/70 transition-colors ${
        scrolled ? "bg-card/95 backdrop-blur-sm" : "bg-card"
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[100rem] items-center gap-3 px-4 sm:h-[5rem] sm:px-6 lg:gap-5 lg:px-10 xl:px-12">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
          <Logo className="shrink-0" imgClassName="h-14 sm:h-16" />
          <div className="hidden sm:block">
            <LocationPicker location={location} onSelect={selectLocation} />
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
          {LANDING_NAV.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-foreground/85 transition-colors hover:bg-secondary hover:text-foreground xl:px-3.5 xl:text-base"
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
            className="hidden h-11 items-center gap-2.5 rounded-full border border-border bg-secondary/70 px-5 text-sm text-muted-foreground transition hover:border-brand/30 hover:bg-secondary md:inline-flex lg:w-[180px] xl:w-[260px]"
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
            className="hidden h-11 rounded-full bg-brand px-6 text-base font-semibold text-brand-foreground hover:bg-brand/90 sm:inline-flex"
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
                    onSelect={selectLocation}
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
