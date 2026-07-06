import { AlertCircle, BadgeCheck, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/hooks/useProfile";

const CONFIG: Record<VerificationStatus, { label: string; className: string; Icon: typeof BadgeCheck }> = {
  pending:      { label: "Pending",       className: "bg-warning-soft text-warning",     Icon: Clock },
  under_review: { label: "Under review",  className: "bg-info-soft text-info",           Icon: AlertCircle },
  verified:     { label: "Verified",      className: "bg-success-soft text-success",     Icon: BadgeCheck },
  rejected:     { label: "Rejected",      className: "bg-destructive/10 text-destructive", Icon: ShieldAlert },
};

export function StatusBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const c = CONFIG[status] ?? CONFIG.pending;
  const Icon = c.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", c.className, className)}>
      <Icon className="h-3 w-3" /> {c.label}
    </span>
  );
}
