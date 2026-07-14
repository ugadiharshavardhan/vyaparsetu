import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/hooks/useCart";
import { useCartSheet } from "@/hooks/useCartSheet";
import { cn } from "@/lib/utils";

export function CartButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost";
}) {
  const count = useCartCount();
  const { openCart } = useCartSheet();

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn("relative overflow-visible rounded-full", className)}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
      onClick={() => openCart()}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 z-10 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white shadow-brand ring-2 ring-card">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
