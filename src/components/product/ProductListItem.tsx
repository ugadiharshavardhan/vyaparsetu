import { Link, useRouterState } from "@tanstack/react-router";
import { Eye, MapPin, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { StockBadge } from "@/components/common/StockBadge";
import { RatingBadge } from "@/components/common/RatingBadge";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { SaveProductButton } from "@/components/product/SaveProductButton";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { getProductDisplayImage } from "@/lib/productImages";
import { browseScrollKey, saveBrowseScroll } from "@/lib/browseScroll";

export function ProductListItem({ product, onQuickView }: { product: Product; onQuickView?: (p: Product) => void }) {
  const banner = getProductDisplayImage(product);
  const location = useRouterState({ select: (r) => r.location });
  const rememberScroll = () => {
    saveBrowseScroll(
      browseScrollKey(location.pathname, location.search as Record<string, unknown>),
    );
  };
  return (
    <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elevated sm:grid-cols-[160px_minmax(0,1fr)_auto]">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
        <img src={banner} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute right-2 top-2 z-10">
          <SaveProductButton product={product} variant="icon" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>{product.brand}</span>
          {product.subCategory && <span>· {product.subCategory}</span>}
          <RatingBadge value={product.rating} count={product.reviewCount} />
        </div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          onClick={rememberScroll}
          className="mt-1 line-clamp-2 text-base font-semibold text-foreground hover:text-brand"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          <span className="font-medium text-foreground">{product.supplier.name}</span>
          {product.supplier.verified && <VerifiedBadge />}
          <MapPin className="ml-1 h-3 w-3" /> {product.supplier.location}
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3 sm:col-span-1 sm:min-w-[220px] sm:flex-col sm:items-end sm:justify-between sm:border-0 sm:pt-0">
        <div className="text-right">
          <PriceDisplay
            price={product.wholesalePrice}
            mrp={product.mrp}
            unit={product.unit}
            gstIncluded={product.gstIncluded}
            gstRate={product.gstRate}
          />
          <div className="mt-1 text-[11px] text-muted-foreground">MOQ {product.moq} {product.unit}</div>
          <div className="mt-1"><StockBadge inStock={product.inStock} stock={product.stockCount} /></div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <SaveProductButton product={product} variant="button" size="sm" />
          <Button variant="outline" size="sm" onClick={() => onQuickView?.(product)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Quick view
          </Button>
          <AddToCartControl product={product} size="sm" className="min-w-[7rem]" />
        </div>
      </div>
    </article>
  );
}

export function ProductList({ products, onQuickView }: { products: Product[]; onQuickView?: (p: Product) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {products.map((p) => <ProductListItem key={p.id} product={p} onQuickView={onQuickView} />)}
    </div>
  );
}
