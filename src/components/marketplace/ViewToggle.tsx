import { Grid2x2, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5">
      {[
        { v: "grid" as const, Icon: Grid2x2 },
        { v: "list" as const, Icon: List },
      ].map(({ v, Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition-colors",
            value === v ? "bg-brand text-white shadow-brand" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`${v} view`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
