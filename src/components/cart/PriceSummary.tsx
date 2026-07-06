import type { PriceBreakup } from "@/types/commerce";
import { inr } from "@/lib/format";

export function PriceSummary({
  breakup,
  itemCount,
  compact = false,
}: {
  breakup: PriceBreakup;
  itemCount: number;
  compact?: boolean;
}) {
  const row = (label: string, value: string, muted = false, accent = false) => (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={`font-medium ${accent ? "text-emerald-600" : "text-foreground"}`}>{value}</span>
    </div>
  );

  return (
    <div className={`space-y-3 ${compact ? "" : "rounded-2xl border border-border bg-card p-5 shadow-soft"}`}>
      {!compact && (
        <div className="mb-2 border-b border-border pb-3 text-sm font-semibold text-foreground">
          Order summary
        </div>
      )}
      {row(`Subtotal (${itemCount} items)`, inr(breakup.subtotal))}
      {breakup.discountTotal > 0 && row("Discount", `− ${inr(breakup.discountTotal)}`, false, true)}
      {breakup.interstate
        ? row(`IGST`, inr(breakup.igst), true)
        : (
          <>
            {row(`CGST`, inr(breakup.cgst), true)}
            {row(`SGST`, inr(breakup.sgst), true)}
          </>
        )}
      {row(
        breakup.shippingTotal === 0 ? "Shipping (FREE)" : "Shipping",
        breakup.shippingTotal === 0 ? "FREE" : inr(breakup.shippingTotal),
        true,
        breakup.shippingTotal === 0,
      )}
      <div className="mt-2 border-t border-border pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">Grand total</span>
          <span className="text-xl font-bold text-foreground">{inr(breakup.grandTotal)}</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Inclusive of all taxes. Prices are wholesale rates.
        </div>
      </div>
    </div>
  );
}
