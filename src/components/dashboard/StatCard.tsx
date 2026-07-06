import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, hint, icon: Icon, tone = "brand", delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "info" | "success" | "warning";
  delay?: number;
}) {
  const toneMap = {
    brand: "bg-brand-soft text-brand",
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        {hint && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
