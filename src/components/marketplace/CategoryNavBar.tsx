import { Link, useRouterState } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { LayoutGrid } from "lucide-react";
import { useCategories } from "@/hooks/useCatalog";
import { cn } from "@/lib/utils";

/** Zepto-style top nav of main wholesale categories. */
export function CategoryNavBar({ activeSlug = null }: { activeSlug?: string | null }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: categories = [] } = useCategories();
  const isAll = !activeSlug && (pathname === "/marketplace" || pathname === "/categories" || pathname === "/categories/");

  return (
    <nav
      aria-label="Main categories"
      className="border-b border-border bg-card"
    >
      <div className="container-page flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavItem
          to="/marketplace"
          active={isAll}
          icon={LayoutGrid}
          label="All"
        />
        {categories.map((c) => {
          const Icon =
            (Icons[c.icon as keyof typeof Icons] as typeof Icons.ShoppingBasket) ?? Icons.Package;
          return (
            <NavItem
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              active={activeSlug === c.slug}
              icon={Icon}
              label={c.name}
            />
          );
        })}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  params,
  active,
  icon: Icon,
  label,
}: {
  to: string;
  params?: { slug: string };
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
        active
          ? "bg-brand-soft text-brand"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
