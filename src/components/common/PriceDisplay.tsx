import { cn } from "@/lib/utils";
import { inr, discountPct } from "@/lib/format";

export function PriceDisplay({
  price, mrp, unit, gstIncluded, gstRate, size = "md", className,
}: {
  price: number;
  mrp?: number;
  unit?: string;
  gstIncluded?: boolean;
  gstRate?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = mrp ? discountPct(mrp, price) : 0;
  const sizes = {
    sm: { price: "text-base", mrp: "text-xs" },
    md: { price: "text-lg", mrp: "text-xs" },
    lg: { price: "text-3xl", mrp: "text-sm" },
  } as const;
  const s = sizes[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-bold text-foreground", s.price)}>{inr(price)}</span>
      {unit && <span className="text-xs text-muted-foreground">/ {unit}</span>}
      {mrp && mrp > price && (
        <span className={cn("text-muted-foreground line-through", s.mrp)}>{inr(mrp)}</span>
      )}
      {off > 0 && (
        <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-success">
          {off}% off
        </span>
      )}
      {gstIncluded !== undefined && gstRate !== undefined && (
        <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
          {gstIncluded ? `GST ${gstRate}% incl.` : `+ ${gstRate}% GST`}
        </span>
      )}
    </div>
  );
}
