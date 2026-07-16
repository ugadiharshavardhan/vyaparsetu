import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/marketplace"
      className={cn(
        "group inline-flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap",
        compact && "justify-center",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-xl gradient-brand font-bold text-white shadow-brand transition-transform group-hover:scale-105",
          compact ? "h-8 w-8 text-sm" : "h-9 w-9 text-base",
        )}
      >
        वि
      </span>
      {!compact && (
        <span className="inline-flex flex-nowrap items-baseline gap-2 leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            VyaparSetu
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
            B2B Marketplace
          </span>
        </span>
      )}
    </Link>
  );
}
