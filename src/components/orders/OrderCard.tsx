import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Package, RotateCcw } from "lucide-react";
import type { Order } from "@/types/commerce";
import { STATUS_LABELS } from "@/lib/commerce";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useRepeatOrder } from "@/hooks/useCart";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  confirmed: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
  processing: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
  packed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
  shipped: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  out_for_delivery: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  return_requested: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  returned: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
};

export function OrderCard({ order }: { order: Order }) {
  const items = order.order_items ?? [];
  const previewImages = items.slice(0, 3);
  const remaining = items.length - previewImages.length;
  const repeat = useRepeatOrder();

  const onRepeat = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
    repeat.mutate(
      items.map((it) => ({
        product_snapshot: it.product_snapshot,
        quantity: it.quantity,
      })),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-border/80 bg-card/65 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-brand/30 hover:shadow-md dark:bg-card/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground/80">
              #{order.order_number}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                STATUS_STYLES[order.status]
              }`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground/85">
            Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-bold tracking-tight text-foreground">{inr(order.grand_total)}</div>
          <div className="text-[10px] font-medium text-muted-foreground/80">
            {items.length} {items.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="flex -space-x-2.5">
          {previewImages.map((it) => (
            <div key={it.id} className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src={it.product_snapshot.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {remaining > 0 && (
            <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-background bg-muted text-xs font-bold text-muted-foreground shadow-sm">
              +{remaining}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-foreground/90">
            {items[0]?.product_snapshot.name}
          </div>
          {items.length > 1 && (
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              plus {items.length - 1} other {items.length - 1 === 1 ? "item" : "items"}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-muted/65 text-muted-foreground/90">
            <Package className="h-3 w-3" />
          </div>
          <span>
            {order.delivery_partner ?? "Delivery"} · ETA{" "}
            <span className="font-semibold text-foreground/80">
              {order.estimated_delivery
                ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "TBD"}
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={repeat.isPending || items.length === 0}
            onClick={onRepeat}
            className="rounded-full text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {repeat.isPending ? "Adding…" : "Repeat"}
          </Button>
          <Button size="sm" asChild className="rounded-full shadow-brand text-xs font-semibold">
            <Link to="/orders/$id" params={{ id: order.id }}>
              View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
