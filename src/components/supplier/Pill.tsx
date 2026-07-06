import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "muted";

const map: Record<Tone, string> = {
  default: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info-soft text-info",
  muted: "bg-muted text-muted-foreground",
};

export function Pill({ tone = "default", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[tone], className)}>
      {children}
    </span>
  );
}
