import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Reusable production-grade empty state. Use for lists that render zero items
 * (orders, wishlist, cart, search results, notifications, etc.).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-10 text-center sm:p-16 ${className}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            <Button
              className="shadow-brand"
              onClick={primaryAction.onClick}
              asChild={!!primaryAction.href}
            >
              {primaryAction.href ? <a href={primaryAction.href}>{primaryAction.label}</a> : <span>{primaryAction.label}</span>}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? <a href={secondaryAction.href}>{secondaryAction.label}</a> : <span>{secondaryAction.label}</span>}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
