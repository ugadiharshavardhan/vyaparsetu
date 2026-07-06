import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PackageSearch, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderCard } from "@/components/orders/OrderCard";
import { useOrders } from "@/hooks/useOrders";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — VyaparSetu" }] }),
  component: OrdersPage,
});

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (query && !o.order_number.toLowerCase().includes(query.toLowerCase())) return false;
      if (tab === "active") return !["delivered", "cancelled", "returned"].includes(o.status);
      if (tab === "delivered") return o.status === "delivered";
      if (tab === "cancelled") return o.status === "cancelled" || o.status === "returned";
      return true;
    });
  }, [orders, tab, query]);

  return (
    <DashboardLayout>
      <div className="container-page py-8">
        <PageHeader
          title="Orders"
          description="Track every purchase, invoice, and delivery in one place."
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {TABS.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order #"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold">
              {orders.length === 0 ? "No orders yet" : "No orders match this filter"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length === 0
                ? "Once you place your first order it will appear here with live tracking and GST invoices."
                : "Try changing the filter or searching a different order number."}
            </p>
            <Button asChild className="mt-5 shadow-brand">
              <Link to="/marketplace">Explore marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
