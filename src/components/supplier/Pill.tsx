import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "muted";

const map: Record<Tone, string> = {
  default: "bg-brand-soft/40 border-brand/20 text-brand",
  success: "bg-success-soft/40 border-success/20 text-success",
  warning: "bg-warning-soft/40 border-warning/20 text-warning",
  danger: "bg-destructive/10 border-destructive/20 text-destructive",
  info: "bg-info-soft/40 border-info/20 text-info",
  muted: "bg-muted/40 border-muted-foreground/15 text-muted-foreground",
};

export function Pill({ tone = "default", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide", map[tone], className)}>
      {children}
    </span>
  );
}
