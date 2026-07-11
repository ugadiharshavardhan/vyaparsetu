import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Heart, MapPin, ShieldCheck, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { discountPct, inr } from "@/lib/format";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { toSnapshot } from "@/lib/commerce";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

export function ProductCard({ product, onQuickView }: Props) {
  const off = discountPct(product.mrp, product.wholesalePrice);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: wishlist } = useWishlist();
  const isFav = !!wishlist?.find((w) => w.product_id === product.id);
  const toggle = useToggleWishlist();
  const add = useAddToCart();
  const snapshot = toSnapshot(product);

  const requireAuth = (fn: () => void) => {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signin" } });
      return;
    }
    fn();
  };

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
        className="absolute inset-0 z-0"
      />
      <div className="relative z-[1] aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
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
              GST Incl.
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              requireAuth(() => toggle.mutate({ snapshot }));
            }}
            className={`grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition-colors ${
              isFav ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
            aria-label="Favorite"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
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
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
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
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {product.supplier.location}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/products/$slug" params={{ slug: product.slug }}>View</Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 shadow-brand"
            disabled={!product.inStock || add.isPending}
            onClick={() => requireAuth(() => add.mutate({ snapshot }))}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
