import { Sparkles } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { useMarketplaceStats } from "@/hooks/useMarketplaceStats";
import { compactNumber } from "@/lib/format";

function formatStat(value: number) {
  if (value <= 0) return "0";
  return compactNumber(value);
}

function StatCell({
  value,
  label,
  suffix = "+",
  ready,
}: {
  value: number;
  label: string;
  suffix?: string;
  ready: boolean;
}) {
  const n = useCountUp(value, 1200, ready && value > 0);
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-2 text-center">
      <div className="font-display text-3xl font-bold tracking-tight text-brand sm:text-4xl lg:text-[2.75rem]">
        {ready ? (
          <>
            {formatStat(n)}
            {suffix}
          </>
        ) : (
          <span className="inline-block h-9 w-16 animate-pulse rounded bg-brand-soft" />
        )}
      </div>
      <div className="mt-2 text-xs font-medium text-foreground sm:text-sm">{label}</div>
    </div>
  );
}

export function ImpactStats() {
  const { data, isLoading, isSuccess } = useMarketplaceStats();
  const ready = isSuccess && !isLoading;

  const stats = [
    {
      value: data?.cities ?? 0,
      label: "cities we're active in",
      suffix: "+",
    },
    {
      value: data?.verifiedSellers ?? 0,
      label: "verified sellers",
      suffix: "+",
    },
    {
      value: data?.products ?? 0,
      label: "SKUs listed",
      suffix: "+",
    },
    {
      value: data?.brands ?? 0,
      label: "seller brands listed",
      suffix: "+",
    },
  ];

  return (
    <section className="border-b border-border bg-card">
      <div className="container-page py-12 sm:py-14">
        <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <StatCell
              key={s.label}
              value={s.value}
              label={s.label}
              suffix={s.suffix}
              ready={ready}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <h2 className="relative inline-flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-brand sm:text-3xl lg:text-4xl">
            <Sparkles className="h-5 w-5 text-brand sm:h-6 sm:w-6" aria-hidden />
            Quality at every step
            <Sparkles className="h-5 w-5 text-brand sm:h-6 sm:w-6" aria-hidden />
          </h2>
          <p className="mt-3 font-display text-base font-semibold text-foreground sm:text-lg">
            — Built on trust —
          </p>
        </div>
      </div>
    </section>
  );
}
