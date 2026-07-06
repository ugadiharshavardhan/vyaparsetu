import { motion } from "framer-motion";
import { Check, Circle, X } from "lucide-react";
import type { Order, StatusHistoryEntry } from "@/types/commerce";
import { ORDER_STATUS_FLOW, STATUS_LABELS } from "@/lib/commerce";

export function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]);
  const isCancelled = order.status === "cancelled";
  const historyMap = new Map<string, StatusHistoryEntry>();
  (order.status_history ?? []).forEach((h) => historyMap.set(h.status, h));

  return (
    <ol className="relative space-y-6 pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full bg-border" />
      {ORDER_STATUS_FLOW.map((s, i) => {
        const done = !isCancelled && i <= currentIdx;
        const active = !isCancelled && i === currentIdx;
        const entry = historyMap.get(s);
        return (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <span
              className={`absolute -left-[19px] top-0 grid h-6 w-6 place-items-center rounded-full ${
                done
                  ? "bg-emerald-600 text-white"
                  : active
                    ? "bg-brand text-white shadow-brand animate-pulse"
                    : "bg-background text-muted-foreground ring-2 ring-border"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
            </span>
            <div className={`text-sm font-semibold ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
              {STATUS_LABELS[s]}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {entry
                ? new Date(entry.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : active
                  ? "In progress"
                  : "Pending"}
            </div>
          </motion.li>
        );
      })}
      {isCancelled && (
        <li className="relative">
          <span className="absolute -left-[19px] top-0 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white">
            <X className="h-3 w-3" />
          </span>
          <div className="text-sm font-semibold text-rose-700">Cancelled</div>
        </li>
      )}
    </ol>
  );
}
