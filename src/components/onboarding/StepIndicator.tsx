import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition",
                done && "border-brand bg-brand text-white",
                active && "border-brand bg-brand-soft text-brand",
                !done && !active && "border-border bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn("truncate text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && <div className={cn("h-px flex-1", done ? "bg-brand" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
