import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-foreground">No products match your filters</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try changing the category, expanding your price range or clearing brand selections.
      </p>
      {onReset && (
        <Button variant="outline" className="mt-6" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
