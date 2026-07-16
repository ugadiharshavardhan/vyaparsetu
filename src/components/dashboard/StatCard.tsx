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
  tone?: "brand" | "info" | "success" | "warning" | "default";
  delay?: number;
}) {
  const toneMap = {
    brand: "bg-brand/10 text-brand dark:bg-brand/15",
    info: "bg-info-soft/40 text-info",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    default: "bg-muted/50 text-muted-foreground",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="rounded-2xl border border-border/50 bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:border-border/80 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl transition-colors", toneMap[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        {hint && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</div>
    </motion.div>
  );
}
