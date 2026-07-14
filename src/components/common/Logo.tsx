import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "group flex items-center gap-2",
        compact && "justify-center",
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
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            VyaparSetu
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            B2B Marketplace
          </span>
        </span>
      )}
    </Link>
  );
}
