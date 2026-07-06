import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Package, RotateCcw } from "lucide-react";
import type { Order } from "@/types/commerce";
import { STATUS_LABELS } from "@/lib/commerce";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  processing: "bg-sky-50 text-sky-700 border-sky-200",
  packed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  out_for_delivery: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  return_requested: "bg-orange-50 text-orange-700 border-orange-200",
  returned: "bg-rose-50 text-rose-700 border-rose-200",
};

export function OrderCard({ order }: { order: Order }) {
  const items = order.order_items ?? [];
  const previewImages = items.slice(0, 3);
  const remaining = items.length - previewImages.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elevated"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order #{order.order_number}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                STATUS_STYLES[order.status]
              }`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">{inr(order.grand_total)}</div>
          <div className="text-[11px] text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 py-3">
        <div className="flex -space-x-2">
          {previewImages.map((it) => (
            <img
              key={it.id}
              src={it.product_snapshot.image}
              alt=""
              className="h-12 w-12 rounded-xl border-2 border-card object-cover shadow-soft"
            />
          ))}
          {remaining > 0 && (
            <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-card bg-secondary text-xs font-semibold text-foreground shadow-soft">
              +{remaining}
            </div>
          )}
        </div>
        <div className="min-w-0 text-xs text-muted-foreground">
          {items[0]?.product_snapshot.name}
          {items.length > 1 && <span> and {items.length - 1} more</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          {order.delivery_partner ?? "Delivery partner"} · ETA{" "}
          {order.estimated_delivery
            ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "TBD"}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Repeat order
          </Button>
          <Button size="sm" asChild className="shadow-brand">
            <Link to="/orders/$id" params={{ id: order.id }}>
              View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
