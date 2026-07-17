import { cn } from "@/lib/utils";
import type { BusinessRole } from "./RoleSelect";

export function AuthRoleToggle({
  value,
  onChange,
  disabled,
}: {
  value: BusinessRole;
  onChange: (role: BusinessRole) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Account type"
      className="grid grid-cols-2 rounded-xl border border-border bg-muted/50 p-1"
    >
      {(
        [
          { id: "buyer", label: "Buyer" },
          { id: "seller", label: "Seller" },
        ] as const
      ).map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-brand text-white shadow-soft"
                : "text-muted-foreground hover:text-foreground",
              disabled && "opacity-60",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
