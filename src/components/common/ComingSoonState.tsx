import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoonState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {cta && (
        <Button className="mt-6 shadow-brand" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
}
