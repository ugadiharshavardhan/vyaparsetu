import { Link } from "@tanstack/react-router";
import type { SubCategory } from "@/types";

export function SubcategoryChips({
  categorySlug,
  items,
  value,
}: {
  categorySlug: string;
  items: SubCategory[];
  value: string | null;
}) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
      <ChipLink
        to="/categories/$slug"
        params={{ slug: categorySlug }}
        search={{}}
        active={!value}
      >
        All
      </ChipLink>
      {items.map((sc) => (
        <ChipLink
          key={sc.slug}
          to="/categories/$slug"
          params={{ slug: categorySlug }}
          search={{ sub: sc.slug }}
          active={value === sc.slug}
        >
          {sc.name}
        </ChipLink>
      ))}
    </div>
  );
}

function ChipLink({
  to,
  params,
  search,
  active,
  children,
}: {
  to: "/categories/$slug";
  params: { slug: string };
  search: { sub?: string };
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      params={params}
      search={search as never}
      className={`inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-brand bg-brand text-white shadow-brand"
          : "border-border bg-card text-foreground hover:border-brand/40 hover:text-brand"
      }`}
    >
      {children}
    </Link>
  );
}
