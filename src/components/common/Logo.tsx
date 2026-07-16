import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  variant = "default",
  className,
}: {
  compact?: boolean;
  variant?: "default" | "onBrand";
  className?: string;
}) {
  const onBrand = variant === "onBrand";
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex shrink-0 flex-nowrap items-center gap-2.5 whitespace-nowrap",
        compact && "justify-center",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-xl font-bold shadow-soft transition-transform group-hover:scale-105",
          onBrand ? "bg-white text-brand" : "bg-brand text-brand-foreground",
          compact ? "h-8 w-8 text-sm" : "h-9 w-9 text-base",
        )}
      >
        वि
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-bold tracking-tight",
              onBrand ? "text-white" : "text-foreground",
            )}
          >
            VyaparSetu
          </span>
          <span
            className={cn(
              "mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
              onBrand ? "text-white/70" : "text-muted-foreground",
            )}
          >
            B2B Marketplace
          </span>
        </span>
      )}
    </Link>
  );
}
