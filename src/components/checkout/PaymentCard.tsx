import { Banknote, CreditCard, Landmark, Smartphone, Wallet, Truck } from "lucide-react";
import type { PaymentMethod } from "@/types/commerce";

const OPTIONS: { key: PaymentMethod; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { key: "credit_card", label: "Credit card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { key: "debit_card", label: "Debit card", hint: "All major banks", icon: Banknote },
  { key: "netbanking", label: "Net banking", hint: "60+ Indian banks", icon: Landmark },
  { key: "wallet", label: "Wallet", hint: "Paytm, Mobikwik, Freecharge", icon: Wallet },
  { key: "cod", label: "Cash on delivery", hint: "Available for orders under ₹50,000", icon: Truck },
];

export function PaymentMethodPicker({
  value,
  onChange,
  grandTotal,
}: {
  value: PaymentMethod | null;
  onChange: (v: PaymentMethod) => void;
  grandTotal: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((o) => {
        const disabled = o.key === "cod" && grandTotal > 50000;
        const selected = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => !disabled && onChange(o.key)}
            disabled={disabled}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              selected
                ? "border-brand bg-brand/5 shadow-brand"
                : "border-border bg-card hover:border-brand/40"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${selected ? "bg-brand text-white" : "bg-secondary text-foreground"}`}>
              <o.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{o.label}</div>
              <div className="text-[11px] text-muted-foreground">{o.hint}</div>
            </div>
            <div className="ml-auto">
              <div className={`h-4 w-4 rounded-full border-2 ${selected ? "border-brand bg-brand" : "border-border"}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
