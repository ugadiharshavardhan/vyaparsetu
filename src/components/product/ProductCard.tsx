import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { SaveProductButton } from "@/components/product/SaveProductButton";
import { discountPct, inr } from "@/lib/format";

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

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-elevated"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        aria-label={product.name}
        className="absolute inset-0 z-10"
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white shadow-brand">
              {off}% OFF
            </span>
          )}
          {product.gstIncluded && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-soft backdrop-blur">
              GST {product.gstRate}%
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <SaveProductButton product={product} variant="icon" />
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-brand"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-foreground/85 py-1.5 text-center text-xs font-semibold text-background">
            Out of stock
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>{product.brand}</span>
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative z-20 line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{inr(product.wholesalePrice)}</span>
          {product.mrp > product.wholesalePrice && (
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          )}
          <span className="ml-auto text-[11px] font-medium text-muted-foreground">
            MOQ: <span className="text-foreground">{product.moq} {product.unit}</span>
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          <span className="truncate font-medium text-foreground">{product.supplier.name}</span>
          {product.supplier.verified && <VerifiedBadge />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {product.supplier.location}
          </span>
          {product.inStock && (
            <span className="inline-flex items-center gap-1">
              <Package className="h-3 w-3" />
              {product.stockCount.toLocaleString("en-IN")} in stock
            </span>
          )}
          {product.deliveryEstimate && (
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {product.deliveryEstimate}
            </span>
          )}
        </div>

        <div className="relative z-20 mt-3 flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/products/$slug" params={{ slug: product.slug }}>View</Link>
          </Button>
          <SaveProductButton product={product} variant="button" size="sm" />
          <AddToCartControl product={product} size="sm" className="min-w-[6.5rem] flex-1" />
        </div>
      </div>
    </motion.article>
  );
}
