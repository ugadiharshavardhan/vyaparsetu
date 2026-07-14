import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title, description, action, children, className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const hasHeader = !!title || !!action;
  
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-soft", !hasHeader ? className : cn("p-6", className))}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={hasHeader ? "mt-5" : ""}>{children}</div>
    </section>
  );
}
