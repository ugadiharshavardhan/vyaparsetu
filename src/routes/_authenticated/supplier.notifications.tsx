import { createFileRoute } from "@tanstack/react-router";
import { Bell, Package, ShieldCheck, ShoppingBag, Star, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useSupplierNotifications } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Supplier" }] }),
  component: NotificationsPage,
});

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  stock: Package,
  review: Star,
  payment: Wallet,
  verification: ShieldCheck,
};

function NotificationsPage() {
  const { notifications, markAllRead, toggle } = useSupplierNotifications();
  return (
    <DashboardLayout>
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Notifications"
          description="Order alerts, low-stock warnings, reviews and payment updates."
          action={<Button variant="outline" onClick={markAllRead}>Mark all read</Button>}
        />
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICON[n.type] ?? Bell;
            return (
              <li key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${n.read ? "border-border bg-card" : "border-brand/30 bg-brand-soft/40"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{n.title}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggle(n.id)}>{n.read ? "Mark unread" : "Mark read"}</Button>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardLayout>
  );
}
