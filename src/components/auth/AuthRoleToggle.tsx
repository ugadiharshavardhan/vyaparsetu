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
      className="grid grid-cols-2 rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] p-1"
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
              "rounded-md px-3 py-2 text-sm font-semibold transition-all",
              active
                ? "bg-[#108548] text-white shadow-sm"
                : "text-[#757575] hover:text-[#1a1a1a]",
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
