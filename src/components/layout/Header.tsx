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
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 md:ml-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-brand" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 min-w-[240px] items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground shadow-soft transition hover:border-brand/40 hover:text-foreground md:inline-flex"
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
            Search products, brands, suppliers…
            <kbd className="ml-auto rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft md:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <CartButton className="h-10 w-10 border border-border bg-card shadow-soft" />

          <div className="hidden md:flex md:items-center md:gap-2">
            <NotificationsMenu />
            <UserMenu />
          </div>


          <Sheet>
            <SheetTrigger asChild>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm p-0">
              <div className="flex items-center justify-between border-b border-border p-5">
                <Logo />
                <SheetTrigger asChild>
                  <button className="grid h-9 w-9 place-items-center rounded-full border border-border" aria-label="Close menu">
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
                    <Link to="/auth" search={{ mode: "signin" }}>Sign in</Link>
                  </Button>
                  <Button className="shadow-brand" asChild>
                    <Link to="/auth" search={{ mode: "signup" }}>Get Started</Link>
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
