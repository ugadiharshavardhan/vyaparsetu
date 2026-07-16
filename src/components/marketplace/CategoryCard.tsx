import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Category } from "@/types";
import { getCategoryTheme } from "@/lib/categoryIconMap";

/** Reliable fallback when a category has no image or the URL fails. */
export const CATEGORY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=70";

export function CategoryImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = !src || failed ? CATEGORY_FALLBACK_IMAGE : src;

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function CategoryCard({ category }: { category: Category }) {
  const theme = getCategoryTheme(category.slug);
  const Icon = theme.icon;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className={`group flex h-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:bg-muted/30 ${theme.borderColor}`}
    >
      <div className="flex w-32 shrink-0 items-center justify-center p-4 sm:w-40">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${theme.bgColor} transition-colors duration-200`}>
          <Icon className={`h-10 w-10 ${theme.iconColor} stroke-[2]`} />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-brand sm:text-lg">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{category.description}</p>
      </div>
    </Link>
  );
}

/** Compact tile for a single-row category strip — icon + title only. */
export function CategoryTile({ category }: { category: Category; index?: number }) {
  const theme = getCategoryTheme(category.slug);
  const Icon = theme.icon;

  return (
    <div className="w-[132px] shrink-0 xl:w-auto xl:min-w-0">
      <Link
        to="/categories/$slug"
        params={{ slug: category.slug }}
        className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-3 transition-colors duration-200 hover:bg-muted/30 ${theme.borderColor}`}
      >
        <div className="flex items-center justify-center py-4 bg-secondary/20 rounded-lg">
          <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${theme.bgColor}`}>
            <Icon className={`h-8 w-8 ${theme.iconColor} stroke-[2]`} />
          </div>
        </div>
        <div className="pt-2">
          <h3 className="line-clamp-2 text-center text-[11px] font-semibold leading-snug text-foreground group-hover:text-brand xl:text-xs">
            {category.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}
