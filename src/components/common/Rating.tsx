import { Star } from "lucide-react";

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
      <Star className="fill-warning text-warning" style={{ width: size, height: size }} />
      {value.toFixed(1)}
      {count !== undefined && (
        <span className="text-muted-foreground">({count.toLocaleString("en-IN")})</span>
      )}
    </span>
  );
}
