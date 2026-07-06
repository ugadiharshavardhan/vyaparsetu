import { CheckCircle2, PackageX, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function StockBadge({ stock, inStock, className }: { stock?: number; inStock: boolean; className?: string }) {
  if (!inStock) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive", className)}>
        <PackageX className="h-3 w-3" /> Out of stock
      </span>
    );
  }
  const low = stock !== undefined && stock < 100;
  if (low) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning", className)}>
        <TriangleAlert className="h-3 w-3" /> Only {stock} left
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success", className)}>
      <CheckCircle2 className="h-3 w-3" /> In stock{stock !== undefined && ` (${stock})`}
    </span>
  );
}
