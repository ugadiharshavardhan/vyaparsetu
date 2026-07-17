import { Skeleton } from "@/components/ui/skeleton";

/** Product card grid skeleton — matches marketplace card dimensions. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-3 h-5 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton — for orders, products, users lists. */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-muted/40 p-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard stat cards skeleton. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-24" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Page header skeleton (title + description) — matches `PageHeader`. */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-52 max-w-[70%]" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

/** Neutral page-shell skeleton — header + a few generic content blocks (NO product cards). */
export function PageSkeleton() {
  return (
    <div className="container-page py-8">
      <PageHeaderSkeleton />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Marketplace / catalog grid: header + product cards. */
export function ProductGridPageSkeleton() {
  return (
    <div className="container-page py-8">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

/** Product detail: gallery + info column. */
export function ProductDetailSkeleton() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-4 w-64 max-w-full" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/** Dashboard: header + stat cards + a wide content panel. */
export function DashboardPageSkeleton({ stats = 4 }: { stats?: number }) {
  return (
    <div className="container-page space-y-8 py-8">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={stats} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} cols={4} />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** List/table page: header + filter bar + table. */
export function TablePageSkeleton() {
  return (
    <div className="container-page space-y-6 py-8">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-sm rounded-full" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

/** Buyer orders list: header + control bar + tall order cards. */
export function OrderListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <PageHeaderSkeleton />
      </div>
      <Skeleton className="mb-6 h-16 w-full rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Detail page (order/customer): header + main panel + sidebar. */
export function DetailPageSkeleton() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-4 w-40" />
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/** Form page: header + form card with fields. */
export function FormPageSkeleton() {
  return (
    <div className="container-page py-8">
      <PageHeaderSkeleton />
      <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
    </div>
  );
}

/** Simple content page: header + paragraph blocks. */
export function ContentPageSkeleton() {
  return (
    <div className="container-page py-10">
      <PageHeaderSkeleton />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
