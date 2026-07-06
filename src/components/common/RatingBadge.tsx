import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingBadge({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-success px-1.5 py-0.5 text-[11px] font-semibold text-white", className)}>
      {value.toFixed(1)} <Star className="h-3 w-3 fill-current" />
      {count !== undefined && (
        <span className="ml-1 rounded bg-white/20 px-1 text-[10px] font-medium">
          {count.toLocaleString("en-IN")}
        </span>
      )}
    </span>
  );
}
