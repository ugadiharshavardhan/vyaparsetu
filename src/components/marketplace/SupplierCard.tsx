import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import type { Supplier } from "@/types";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Button } from "@/components/ui/button";

export function SupplierCard({ supplier, productCount }: { supplier: Supplier; productCount?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl gradient-brand text-lg font-bold text-white shadow-brand">
          {supplier.logo ? <img src={supplier.logo} alt="" className="h-full w-full object-cover" /> : supplier.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{supplier.name}</h3>
            {supplier.verified && <VerifiedBadge />}
          </div>
          {supplier.businessType && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-brand">{supplier.businessType}</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {supplier.location}
          </div>
          <div className="mt-2"><Rating value={supplier.rating} count={supplier.reviewCount} /></div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-xs">
        <div>
          <div className="font-semibold text-foreground">{productCount ?? supplier.totalProducts ?? 0}</div>
          <div className="text-muted-foreground">SKUs</div>
        </div>
        <div>
          <div className="font-semibold text-foreground">{supplier.yearsActive}yr</div>
          <div className="text-muted-foreground">On platform</div>
        </div>
        <div>
          <div className="inline-flex items-center gap-0.5 font-semibold text-brand">
            <TrendingUp className="h-3 w-3" /> {supplier.responseRate ?? 92}%
          </div>
          <div className="text-muted-foreground">Reply rate</div>
        </div>
      </div>
      <Button asChild variant="outline" className="mt-5 w-full">
        <Link
          to="/suppliers/$id"
          params={{ id: supplier.id }}
          preload="intent"
        >
          <ShieldCheck className="mr-1.5 h-4 w-4" /> View store
        </Link>
      </Button>
    </div>
  );
}
