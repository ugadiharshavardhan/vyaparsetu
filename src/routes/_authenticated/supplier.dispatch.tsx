import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, PackageCheck, Clock, MapPin, Search, Printer, QrCode } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders, type SupplierOrder } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch Center — Seller" }] }),
  component: DispatchPage,
});

const COURIERS = ["Delhivery", "BlueDart", "XpressBees", "Ekart", "DTDC"];

function DispatchPage() {
  const { orders, updateStatus } = useSupplierOrders();
  const [tab, setTab] = useState("ready");
  const [q, setQ] = useState("");

  const readyForPickup = orders.filter((o) => o.status === "packed");
  const inTransit = orders.filter((o) => o.status === "shipped");
  const delivered = orders.filter((o) => o.status === "delivered");

  const rows = (tab === "ready" ? readyForPickup : tab === "transit" ? inTransit : delivered)
    .filter((o) => !q || `${o.orderNumber} ${o.customer} ${o.destination}`.toLowerCase().includes(q.toLowerCase()));

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Dispatch Center"
          description="Prepare shipments, print labels, hand off to couriers and track deliveries in real time."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.info("Scanner opened")}><QrCode className="mr-1.5 h-4 w-4" /> Scan parcel</Button>
              <Button onClick={() => toast.success("Bulk labels queued")}><Printer className="mr-1.5 h-4 w-4" /> Print labels</Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Ready for pickup" value={String(readyForPickup.length)} hint="Awaiting courier" icon={PackageCheck} tone="warning" />
          <StatCard label="In transit" value={String(inTransit.length)} hint="Shipped" icon={Truck} tone="info" delay={0.05} />
          <StatCard label="Delivered (30d)" value={String(delivered.length)} hint="Completed" icon={PackageCheck} tone="success" delay={0.1} />
          <StatCard label="Avg. handover time" value="6h 24m" hint="Order → courier" icon={Clock} tone="brand" delay={0.15} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="ready">Ready for pickup ({readyForPickup.length})</TabsTrigger>
              <TabsTrigger value="transit">In transit ({inTransit.length})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({delivered.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search AWB, order, destination" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <DataTable<SupplierOrder>
          rows={rows}
          columns={[
            { key: "order", header: "Order", cell: (o) => (
              <div>
                <div className="font-semibold">{o.orderNumber}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
              </div>
            )},
            { key: "customer", header: "Customer", cell: (o) => (
              <div>
                <div className="font-medium">{o.customer}</div>
                <div className="text-xs text-muted-foreground">{o.product} · {o.qty} units</div>
              </div>
            )},
            { key: "dest", header: "Destination", cell: (o) => (
              <span className="inline-flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {o.destination}</span>
            )},
            { key: "courier", header: "Courier", cell: (o) => (
              <span className="text-sm">{COURIERS[Math.abs(o.id.charCodeAt(2)) % COURIERS.length]}</span>
            )},
            { key: "amount", header: "Value", cell: (o) => <span className="font-semibold">{inr(o.amount)}</span> },
            { key: "status", header: "Status", cell: (o) => (
              <Pill tone={o.status === "packed" ? "warning" : o.status === "shipped" ? "info" : "success"}>{o.status}</Pill>
            )},
            { key: "actions", header: "", className: "text-right", cell: (o) => (
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toast.success(`Label printed for ${o.orderNumber}`); }}>Label</Button>
                {o.status === "packed" && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); updateStatus(o.id, "shipped"); toast.success("Marked shipped"); }}>Ship</Button>
                )}
                {o.status === "shipped" && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); updateStatus(o.id, "delivered"); toast.success("Marked delivered"); }}>Deliver</Button>
                )}
              </div>
            )},
          ]}
          empty={<div className="py-6 text-center text-sm text-muted-foreground">No shipments in this queue.</div>}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Courier performance" description="On-time delivery this month">
            <ul className="space-y-3">
              {COURIERS.map((c, i) => {
                const perf = 82 + ((i * 7) % 16);
                return (
                  <li key={c} className="flex items-center gap-3">
                    <span className="w-28 text-sm font-medium">{c}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${perf}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold">{perf}%</span>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
          <SectionCard title="Dispatch checklist" description="Reduce RTOs with these best-practices">
            <ul className="space-y-2 text-sm">
              {["Verify AWB before handover","Attach invoice on outer package","Photograph fragile cartons","Update tracking within 2 hours","Reconcile pickups daily"].map((x) => (
                <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand" />{x}</li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    
  );
}
