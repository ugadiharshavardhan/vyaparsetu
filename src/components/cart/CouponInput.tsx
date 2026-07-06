import { useState } from "react";
import { Ticket, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidateCoupon } from "@/hooks/useCoupon";
import type { Coupon } from "@/types/commerce";
import { toast } from "sonner";

export function CouponInput({
  subtotal,
  coupon,
  onApply,
  onClear,
}: {
  subtotal: number;
  coupon: Coupon | null;
  onApply: (c: Coupon) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const mut = useValidateCoupon();

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-emerald-900">{coupon.code} applied</div>
            <div className="text-[11px] text-emerald-700">
              {coupon.discount_type === "percentage"
                ? `${coupon.discount_value}% off`
                : `Flat ₹${coupon.discount_value} off`}
            </div>
          </div>
        </div>
        <button onClick={onClear} className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100" aria-label="Remove">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Ticket className="h-3.5 w-3.5" /> Have a coupon?
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter code (e.g. WELCOME10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <Button
          disabled={!code || mut.isPending}
          onClick={() =>
            mut.mutate(
              { code, subtotal },
              {
                onSuccess: (c) => {
                  onApply(c);
                  toast.success(`${c.code} applied`);
                  setCode("");
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Apply
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
        Try: <button onClick={() => setCode("WELCOME10")} className="rounded-full bg-white px-2 py-0.5 font-medium text-foreground hover:bg-brand hover:text-white">WELCOME10</button>
        <button onClick={() => setCode("FLAT500")} className="rounded-full bg-white px-2 py-0.5 font-medium text-foreground hover:bg-brand hover:text-white">FLAT500</button>
        <button onClick={() => setCode("BULK15")} className="rounded-full bg-white px-2 py-0.5 font-medium text-foreground hover:bg-brand hover:text-white">BULK15</button>
      </div>
    </div>
  );
}
