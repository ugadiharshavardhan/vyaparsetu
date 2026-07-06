import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white font-bold shadow-brand transition-transform group-hover:scale-105"
      >
        वि
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
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
