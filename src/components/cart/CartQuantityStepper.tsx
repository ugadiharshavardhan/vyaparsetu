import { Minus, Plus, Trash2 } from "lucide-react";
import { effectiveStockCap, stepCartQuantity } from "@/lib/moq";
import { cn } from "@/lib/utils";

const stepBtn =
  "grid shrink-0 place-items-center text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand";

const SIZE = {
  sm: {
    shell: "h-9",
    btn: "h-full w-9 min-w-9",
    icon: "h-4 w-4",
    qty: "text-sm font-semibold",
  },
  md: {
    shell: "h-11",
    btn: "h-full w-10 min-w-10",
    icon: "h-4 w-4",
    qty: "text-sm font-semibold",
  },
  lg: {
    shell: "h-14",
    btn: "h-full w-14 min-w-14",
    icon: "h-5 w-5",
    qty: "text-lg font-bold",
  },
} as const;

type Props = {
  quantity: number;
  moq: number;
  stockCount?: number;
  onQuantityChange: (next: number) => void;
  onBlocked?: (delta: -1 | 1) => void;
  /** When provided, pressing minus at MOQ removes the line instead of being blocked. */
  onRemove?: () => void;
  pending?: boolean;
  size?: keyof typeof SIZE;
  className?: string;
};

export function CartQuantityStepper({
  quantity,
  moq,
  stockCount,
  onQuantityChange,
  onBlocked,
  onRemove,
  size = "sm",
  className,
}: Props) {
  const stockCap = effectiveStockCap(stockCount);
  const atMoq = quantity <= moq;
  const removeAtFloor = atMoq && !!onRemove;
  const cfg = SIZE[size];

  const step = (delta: -1 | 1) => {
    if (delta === -1 && atMoq) {
      if (onRemove) {
        onRemove();
        return;
      }
      onBlocked?.(-1);
      return;
    }
    const next = stepCartQuantity(quantity, delta, moq, stockCap);
    if (next == null) {
      onBlocked?.(delta);
      return;
    }
    onQuantityChange(next);
  };

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-brand/35 bg-white shadow-soft",
        cfg.shell,
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={atMoq && !onRemove}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          step(-1);
        }}
        className={cn(
          stepBtn,
          cfg.btn,
          "rounded-l-full",
          removeAtFloor && "text-destructive hover:bg-destructive hover:text-white",
        )}
        aria-label={removeAtFloor ? "Remove from cart" : "Decrease quantity"}
      >
        {removeAtFloor ? (
          <Trash2 className={cfg.icon} strokeWidth={2.25} />
        ) : (
          <Minus className={cfg.icon} strokeWidth={2.25} />
        )}
      </button>
      <div
        className={cn(
          "flex min-w-[2.5rem] flex-1 items-center justify-center px-2 tabular-nums text-foreground",
          cfg.qty,
        )}
      >
        {quantity}
      </div>
      <button
        type="button"
        disabled={stockCap != null && quantity >= stockCap}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          step(1);
        }}
        className={cn(stepBtn, cfg.btn, "rounded-r-full")}
        aria-label="Increase quantity"
      >
        <Plus className={cfg.icon} strokeWidth={2.25} />
      </button>
    </div>
  );
}
