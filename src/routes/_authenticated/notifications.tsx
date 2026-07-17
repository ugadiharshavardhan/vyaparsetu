import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useBuyerNotifications, formatRelativeTime } from "@/hooks/useBuyerNotifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — VyaparSetu" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, isUnread } = useBuyerNotifications();

  return (
    <div className="container-page py-10">
      <PageHeader title="Notifications" description="Updates from your orders and cart activity." />

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <BellOff className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold">No notifications yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When you place an order or add items to your cart, updates will show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y rounded-2xl border border-border bg-card shadow-soft">
          {notifications.map((n, i) => (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                to={n.link}
                className={cn(
                  "flex gap-4 p-5 hover:bg-muted/40",
                  isUnread(n) && "bg-brand-soft/10",
                )}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{n.title}</p>
                    {isUnread(n) && <span className="h-2 w-2 rounded-full bg-brand" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.timestamp)}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
