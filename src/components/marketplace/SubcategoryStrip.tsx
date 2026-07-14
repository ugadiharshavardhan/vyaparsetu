import { Link } from "@tanstack/react-router";
import type { SubCategory } from "@/types";
import { CategoryImage } from "@/components/marketplace/CategoryCard";

/** Zepto-style subcategory image cards under the main category nav. */
export function SubcategoryStrip({
  categorySlug,
  items,
  activeSub = null,
}: {
  categorySlug: string;
  items: SubCategory[];
  activeSub?: string | null;
}) {
  if (!items.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <SubCard
        to="/categories/$slug"
        params={{ slug: categorySlug }}
        search={{}}
        label="All"
        image={items[0]?.image}
        active={!activeSub}
      />
      {items.map((sc) => (
        <SubCard
          key={sc.slug}
          to="/categories/$slug"
          params={{ slug: categorySlug }}
          search={{ sub: sc.slug }}
          label={sc.name}
          image={sc.image}
          active={activeSub === sc.slug}
        />
      ))}
    </div>
  );
}

function SubCard({
  to,
  params,
  search,
  label,
  image,
  active,
}: {
  to: "/categories/$slug";
  params: { slug: string };
  search: { sub?: string };
  label: string;
  image?: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      params={params}
      search={search as never}
      className={`group flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-2 sm:w-[112px] ${
        active ? "opacity-100" : "opacity-95"
      }`}
    >
      <div
        className={`aspect-square w-full overflow-hidden rounded-2xl border bg-secondary transition-all ${
          active
            ? "border-brand shadow-brand ring-2 ring-brand/30"
            : "border-border group-hover:border-brand/40 group-hover:shadow-soft"
        }`}
      >
        <CategoryImage
          src={image}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <span
        className={`line-clamp-2 text-center text-[11px] font-semibold leading-snug sm:text-xs ${
          active ? "text-brand" : "text-foreground group-hover:text-brand"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
