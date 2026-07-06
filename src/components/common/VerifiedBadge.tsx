import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info">
      <BadgeCheck className="h-3 w-3" />
      {label}
    </span>
  );
}
