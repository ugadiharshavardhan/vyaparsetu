import { useCallback, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Package, ShoppingCart } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/hooks/useCart";

export type BuyerNotification = {
  id: string;
  type: "order" | "cart";
  title: string;
  body: string;
  /** ISO timestamp used for ordering + unread detection. */
  timestamp: string;
  icon: LucideIcon;
  /** In-app destination when the notification is clicked. */
  link: "/orders" | "/cart";
};

const LAST_SEEN_KEY = "vs.buyer-notifications.last-seen.v1";

function readLastSeen(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(LAST_SEEN_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeLastSeen(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SEEN_KEY, String(value));
  } catch {
    /* ignore */
  }
}

function toTime(iso: string | undefined): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Short "2h ago" style relative time. */
export function formatRelativeTime(iso: string | undefined): string {
  const t = toTime(iso);
  if (!t) return "";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(t).toLocaleDateString();
}

function statusLabel(status: string | undefined): string {
  if (!status) return "Placed";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Real buyer notifications derived from the buyer's own activity:
 *  - orders they placed (from the `orders` table)
 *  - items currently added to their cart (from `cart_items`)
 *
 * Unread is tracked with a localStorage "last seen" timestamp; opening the
 * menu (via `markAllSeen`) clears the badge.
 */
export function useBuyerNotifications() {
  const { data: orders = [] } = useOrders();
  const { data: cartItems = [] } = useCart();
  const [lastSeen, setLastSeen] = useState<number>(() => readLastSeen());

  const notifications = useMemo<BuyerNotification[]>(() => {
    const out: BuyerNotification[] = [];

    for (const o of orders) {
      const count = o.order_items?.length ?? 0;
      out.push({
        id: `order-${o.id}`,
        type: "order",
        title: `Order ${o.order_number} placed`,
        body:
          count > 0
            ? `${count} item${count > 1 ? "s" : ""} • ${statusLabel(o.status)}`
            : statusLabel(o.status),
        timestamp: o.created_at,
        icon: Package,
        link: "/orders",
      });
    }

    for (const c of cartItems) {
      if (c.saved_for_later) continue;
      const name = c.product_snapshot?.name ?? "Item";
      const unit = c.product_snapshot?.unit ?? "units";
      out.push({
        id: `cart-${c.id}`,
        type: "cart",
        title: `Added ${name} to cart`,
        body: `${c.quantity} ${unit} in your cart`,
        timestamp: c.created_at || c.updated_at,
        icon: ShoppingCart,
        link: "/cart",
      });
    }

    out.sort((a, b) => toTime(b.timestamp) - toTime(a.timestamp));
    return out;
  }, [orders, cartItems]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => toTime(n.timestamp) > lastSeen).length,
    [notifications, lastSeen],
  );

  const markAllSeen = useCallback(() => {
    const now = Date.now();
    writeLastSeen(now);
    setLastSeen(now);
  }, []);

  const isUnread = useCallback(
    (n: BuyerNotification) => toTime(n.timestamp) > lastSeen,
    [lastSeen],
  );

  return { notifications, unreadCount, markAllSeen, isUnread };
}
