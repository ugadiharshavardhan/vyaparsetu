import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { discountPct, inr } from "@/lib/format";
import { getProductDisplayImage } from "@/lib/productImages";

const PRODUCT_FALLBACK =
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=70";

function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={!src || failed ? PRODUCT_FALLBACK : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

export function ProductCard({ product, onQuickView }: Props) {
  const off = discountPct(product.mrp, product.wholesalePrice);
  const displayImage = getProductDisplayImage(product);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-brand/40">
      {/* Image area */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-secondary/30"
      >
        <ProductImage
          src={displayImage}
          alt={product.name}
          className="h-full w-full object-contain p-1.5"
        />
        {off > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
            {off}% OFF
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded bg-foreground/85 px-3 py-1 text-[10px] font-bold uppercase text-background">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* ADD button */}
      <div className="absolute right-3 z-10" style={{ top: "calc(55.5% - 16px)" }}>
        <AddToCartControl
          product={product}
          size="sm"
          className="rounded-lg border border-brand bg-white text-brand font-bold text-xs px-4 h-7 min-w-0 cursor-pointer hover:bg-brand hover:text-white"
        />
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-1 p-3.5 pt-3">
        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{inr(product.wholesalePrice)}</span>
          {product.mrp > product.wholesalePrice && (
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          )}
        </div>

        {/* Product name */}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-brand"
        >
          {product.name}
        </Link>

        {/* MOQ */}
        <span className="text-xs text-muted-foreground mt-0.5">
          MOQ: {product.moq} {product.unit}
        </span>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-[2px] text-[10px] font-bold text-white">
              <Star className="h-2.5 w-2.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount > 999
                  ? `${(product.reviewCount / 1000).toFixed(1)}k`
                  : product.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
