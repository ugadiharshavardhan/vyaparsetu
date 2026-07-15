import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSkeleton, ProductGridSkeleton, TableSkeleton } from "@/components/common/Skeletons";

/** Compact spinner for buttons / inline actions. */
export function LoadingSpinner({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

/** Full-area overlay while a mutation / route transition runs. */
export function LoadingOverlay({
  show,
  label = "Loading…",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-background/55 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </div>
  );
}

/** Default route pending UI while loaders / navigations resolve. */
export function RoutePending() {
  return (
    <div className="min-h-[50vh]">
      <PageSkeleton />
    </div>
  );
}

export function MarketplacePending() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function DashboardPending() {
  return (
    <div className="container-page space-y-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}
