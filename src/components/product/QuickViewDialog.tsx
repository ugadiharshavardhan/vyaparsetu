import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Product } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { discountPct, inr } from "@/lib/format";

export function QuickViewDialog({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (v: boolean) => void;
}) {
  const off = product ? discountPct(product.mrp, product.wholesalePrice) : 0;
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {product && (
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative bg-secondary">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-brand">
                  {off}% OFF
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 p-6">
              <DialogHeader>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                <DialogTitle className="text-xl leading-snug">{product.name}</DialogTitle>
              </DialogHeader>
              <Rating value={product.rating} count={product.reviewCount} />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{inr(product.wholesalePrice)}</span>
                {product.mrp > product.wholesalePrice && (
                  <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
                )}
                <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                  MOQ {product.moq} {product.unit}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="rounded-xl border border-border bg-secondary/60 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <span className="font-medium">{product.supplier.name}</span>
                  {product.supplier.verified && <VerifiedBadge />}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {product.supplier.location}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button asChild className="flex-1 shadow-brand">
                  <Link to="/products/$slug" params={{ slug: product.slug }}>View Full Details</Link>
                </Button>
                <Button variant="outline" className="flex-1" disabled title="Available after sign in">
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
