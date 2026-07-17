import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/types";
import type { ProductSnapshot } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsSaved, useToggleWishlist } from "@/hooks/useWishlist";
import { toSnapshot } from "@/lib/commerce";
import { cn } from "@/lib/utils";

type Props = {
  product?: Product;
  /** Use when only a wishlist/cart snapshot is available (e.g. saved items). */
  snapshot?: ProductSnapshot;
  /** icon = circular heart; button = labeled Save / Saved */
  variant?: "icon" | "button";
  size?: "sm" | "lg";
  className?: string;
};

export function SaveProductButton({
  product,
  snapshot: snapshotProp,
  variant = "icon",
  size = "sm",
  className,
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const snapshot = snapshotProp ?? (product ? toSnapshot(product) : null);
  const saved = useIsSaved(snapshot?.id);
  const toggle = useToggleWishlist();

  if (!snapshot) return null;

  const onSave = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) {
      navigate({
        to: "/auth",
        search: { mode: "signin", role: "buyer", redirect: `/products/${snapshot.slug}` },
      });
      return;
    }
    toggle.mutate({ snapshot });
  };

  if (variant === "button") {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={toggle.isPending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved items" : "Save item"}
        className={cn(
          saved && "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
          className,
        )}
        onClick={onSave}
      >
        <Heart className={cn("mr-1.5 h-4 w-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={toggle.isPending}
      onClick={onSave}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved items" : "Save item"}
      title={saved ? "Saved" : "Save"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition-colors",
        saved
          ? "text-destructive"
          : "text-muted-foreground hover:text-destructive",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
