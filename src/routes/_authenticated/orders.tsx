import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PackageSearch, Search } from "lucide-react";
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <PageHeader
          title="Orders"
          description="Track every purchase, invoice, and delivery in one place."
        />
      </div>

      {/* Control Bar: Tabs + Search input */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-muted/10">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 gap-1 bg-transparent p-0 sm:flex">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order #"
            className="h-10 rounded-full border-border/80 pl-10 pr-4 text-xs shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-brand/40"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border/80 bg-card/60 p-10 text-center shadow-sm backdrop-blur-md dark:bg-card/30"
        >
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand">
            <PackageSearch className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {orders.length === 0
              ? "Once you place your first B2B purchase, it will appear here with live tracking, status logs, and GST invoices."
              : "We couldn't find any orders matching that order number. Try another filter or search term."}
          </p>
          <Button asChild className="mt-6 rounded-full px-6 shadow-brand text-xs font-semibold">
            <Link to="/marketplace">Explore marketplace</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
