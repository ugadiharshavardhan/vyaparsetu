import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Category } from "@/types";

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
  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex h-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-secondary sm:w-36">
        <CategoryImage
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
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

/** Compact tile for a single-row category strip — image + title only. */
export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="w-[132px] shrink-0 xl:w-auto xl:min-w-0"
    >
      <Link
        to="/categories/$slug"
        params={{ slug: category.slug }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-elevated"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <CategoryImage
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-2.5">
          <h3 className="line-clamp-2 text-center text-[11px] font-semibold leading-snug text-foreground group-hover:text-brand xl:text-xs">
            {category.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
