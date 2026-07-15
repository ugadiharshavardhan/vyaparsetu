import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/common/Logo";
import { NAV_LINKS } from "@/constants/site";
import { SearchDialog } from "@/components/search/SearchDialog";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartButton } from "@/components/cart/CartButton";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "glass border-b border-border/60" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      {/* Full viewport width — no max-width container so the bar spans edge to edge */}
      <div className="flex h-14 w-full flex-nowrap items-center gap-3 whitespace-nowrap px-4 sm:h-16 sm:px-6 lg:gap-4 lg:px-8">
        <Logo className="shrink-0" />

        <nav className="hidden min-w-0 shrink items-center gap-0.5 lg:flex xl:gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-brand" }}
              className="rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:px-3"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 max-w-[220px] flex-nowrap items-center gap-2 overflow-hidden rounded-full border border-border bg-card px-3 text-sm text-muted-foreground shadow-soft transition hover:border-brand/40 hover:text-foreground md:inline-flex lg:max-w-none lg:min-w-[200px] xl:min-w-[260px]"
            aria-label="Search products"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate whitespace-nowrap">Search products…</span>
            <kbd className="ml-auto shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft md:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <CartButton className="h-9 w-9 shrink-0 border border-border bg-card shadow-soft" />

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <NotificationsMenu />
            <UserMenu />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground lg:hidden"
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
                    className="grid h-9 w-9 place-items-center rounded-full border border-border"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetTrigger>
              </div>
              <div className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/auth" search={{ mode: "signin" }}>
                      Sign in
                    </Link>
                  </Button>
                  <Button className="shadow-brand" asChild>
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Get Started
                    </Link>
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
