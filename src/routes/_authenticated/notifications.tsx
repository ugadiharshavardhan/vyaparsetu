import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { DEMO_NOTIFICATIONS } from "@/data/dashboard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — VyaparSetu" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="container-page py-10">
      <PageHeader title="Notifications" description="All updates from orders, verification and suppliers." />
      <ul className="mt-8 divide-y rounded-2xl border border-border bg-card shadow-soft">
        {DEMO_NOTIFICATIONS.map((n, i) => (
          <motion.li
            key={n.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn("flex gap-4 p-5 hover:bg-muted/40", n.unread && "bg-brand-soft/10")}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <n.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{n.title}</p>
                {n.unread && <span className="h-2 w-2 rounded-full bg-brand" />}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
