import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, PackageCheck, Clock, MapPin, Search, Printer, QrCode, FileText, CheckCircle2, Navigation, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders, type SupplierOrder } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch Center — Seller" }] }),
  component: DispatchPage,
});

function DispatchPage() {
  const { orders, updateStatus } = useSupplierOrders();
  const [tab, setTab] = useState("ready");
  const [q, setQ] = useState("");

  const pendingDispatch = orders.filter((o) => o.status === "packing" || o.status === "accepted");
  const readyForPickup = orders.filter((o) => o.status === "ready");
  const inTransit = orders.filter((o) => o.status === "picked_up" || o.status === "shipped");
  const delivered = orders.filter((o) => o.status === "delivered");
  
  // Pickups today mock: check if pickupTime is today
  const pickupsToday = orders.filter((o) => o.pickupTime && new Date(o.pickupTime).toDateString() === new Date().toDateString());
  const assignedPorters = orders.filter((o) => o.porterName && (o.status === "ready" || o.status === "picked_up" || o.status === "shipped"));

  const rows = (tab === "ready" ? readyForPickup : tab === "pending" ? pendingDispatch : tab === "transit" ? inTransit : delivered)
    .filter((o) => !q || `${o.orderNumber} ${o.customer} ${o.destination} ${o.porterName || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Dispatch & Logistics"
        description="Assign porters, track shipments, and manage deliveries."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info("Scanner opened")}><QrCode className="mr-1.5 h-4 w-4" /> Scan Parcel</Button>
            <Button onClick={() => toast.success("Bulk labels queued")}><Printer className="mr-1.5 h-4 w-4" /> Batch Print</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title="Pending Dispatch" value={pendingDispatch.length} tone="text-foreground" />
        <SummaryCard title="Ready for Pickup" value={readyForPickup.length} tone="text-warning" />
        <SummaryCard title="Assigned Porters" value={assignedPorters.length} tone="text-info" />
        <SummaryCard title="Pickups Today" value={pickupsToday.length} tone="text-brand" />
        <SummaryCard title="Deliveries (30d)" value={delivered.length} tone="text-success" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingDispatch.length})</TabsTrigger>
            <TabsTrigger value="ready">Ready for Pickup ({readyForPickup.length})</TabsTrigger>
            <TabsTrigger value="transit">In Transit ({inTransit.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
          
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-background" placeholder="Search Order ID, Retailer, Porter..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <TabsContent value={tab} className="m-0 space-y-6">
          <SectionCard className="p-0 overflow-visible">
            <DataTable<SupplierOrder>
              rows={rows}
              pageSize={10}
              columns={[
                { 
                  key: "order", 
                  header: "Order & Retailer", 
                  cell: (o) => (
                    <div className="flex flex-col">
                      <div className="font-bold text-foreground">{o.orderNumber}</div>
                      <div className="text-sm font-medium">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  )
                },
                { 
                  key: "logistics", 
                  header: "Logistics", 
                  cell: (o) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Navigation className="h-3.5 w-3.5 text-muted-foreground" /> 
                        <span className="font-medium">{o.porterName || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {o.destination}
                      </div>
                    </div>
                  )
                },
                { 
                  key: "timeline", 
                  header: "Timeline", 
                  cell: (o) => (
                    <div className="flex flex-col text-sm">
                      {o.pickupTime ? (
                        <>
                          <span className="font-medium">Pickup: {new Date(o.pickupTime).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">ETA: {o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : "TBD"}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Pending Scheduling</span>
                      )}
                    </div>
                  )
                },
                { 
                  key: "status", 
                  header: "Status", 
                  cell: (o) => (
                    <Pill tone={o.status === "ready" ? "warning" : o.status === "shipped" || o.status === "picked_up" ? "info" : o.status === "delivered" ? "success" : "muted"}>
                      {o.status.replace("_", " ")}
                    </Pill>
                  )
                },
                { 
                  key: "actions", 
                  header: "", 
                  className: "text-right", 
                  cell: (o) => (
                    <div className="flex justify-end gap-2 items-center">
                      <LogisticsDialog order={o} onUpdate={updateStatus} />
                    </div>
                  )
                },
              ]}
              empty={<div className="py-12 text-center text-muted-foreground">No shipments found in this category.</div>}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ title, value, tone }: { title: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-xs font-medium text-muted-foreground mb-2 line-clamp-1">{title}</div>
      <div className={cn("text-2xl font-display font-bold", tone)}>{value}</div>
    </div>
  );
}

function LogisticsDialog({ order, onUpdate }: { order: SupplierOrder; onUpdate: any }) {
  const [open, setOpen] = useState(false);
  const [porterName, setPorterName] = useState(order.porterName || "");
  const [porterContact, setPorterContact] = useState(order.porterContact || "");
  const [vehicle, setVehicle] = useState(order.vehicleDetails || "");
  
  const isAssigned = !!order.porterName;
  
  const handleAssign = () => {
    if (!porterName) { toast.error("Porter name is required"); return; }
    onUpdate(order.id, "ready", { porterName, porterContact, vehicleDetails: vehicle, pickupTime: new Date().toISOString() });
    toast.success("Porter assigned & marked ready for pickup");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isAssigned ? "outline" : "default"} className={!isAssigned ? "bg-brand" : ""}>
          {isAssigned ? "Track" : "Assign Porter"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Logistics — {order.orderNumber}</DialogTitle></DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-4">Shipment Timeline</h4>
              <div className="space-y-4 relative pl-4 border-l-2 border-border ml-2 text-sm">
                <TimelineStep active title="Order Accepted" subtitle={new Date(order.createdAt).toLocaleDateString()} />
                <TimelineStep active={order.status === "packing" || order.status === "ready" || order.status === "picked_up" || order.status === "shipped" || order.status === "delivered"} title="Packing" />
                <TimelineStep active={order.status === "ready" || order.status === "picked_up" || order.status === "shipped" || order.status === "delivered"} title="Ready for Pickup" subtitle={order.pickupTime ? new Date(order.pickupTime).toLocaleDateString() : ""} />
                <TimelineStep active={order.status === "picked_up" || order.status === "shipped" || order.status === "delivered"} title="Porter Assigned" subtitle={order.porterName} />
                <TimelineStep active={order.status === "shipped" || order.status === "delivered"} title="In Transit" />
                <TimelineStep active={order.status === "delivered"} title="Delivered" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="w-full" onClick={() => toast.info("Printing slip...")}><FileText className="mr-1.5 h-4 w-4" /> Pickup Slip</Button>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <h4 className="font-bold text-sm mb-4">Porter Details</h4>
            
            {order.status === "delivered" || order.status === "shipped" || order.status === "picked_up" ? (
               <div className="space-y-4 text-sm">
                 <div>
                    <div className="text-muted-foreground text-xs mb-1">Porter Name</div>
                    <div className="font-semibold">{order.porterName}</div>
                 </div>
                 <div>
                    <div className="text-muted-foreground text-xs mb-1">Contact</div>
                    <div className="font-semibold">{order.porterContact || "N/A"}</div>
                 </div>
                 <div>
                    <div className="text-muted-foreground text-xs mb-1">Vehicle Details</div>
                    <div className="font-semibold">{order.vehicleDetails || "N/A"}</div>
                 </div>
                 
                 {order.status !== "delivered" && (
                   <Button className="w-full mt-4" onClick={() => { onUpdate(order.id, "delivered"); toast.success("Marked Delivered"); setOpen(false); }}>
                     Mark as Delivered
                   </Button>
                 )}
               </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <Label className="mb-1 block">Porter / Courier Name</Label>
                  <Input value={porterName} onChange={e => setPorterName(e.target.value)} placeholder="e.g. Raju Delivery" />
                </div>
                <div>
                  <Label className="mb-1 block">Contact Number</Label>
                  <Input value={porterContact} onChange={e => setPorterContact(e.target.value)} placeholder="+91" />
                </div>
                <div>
                  <Label className="mb-1 block">Vehicle Details</Label>
                  <Input value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="MH 01 AB 1234" />
                </div>
                
                <Button className="w-full bg-brand" onClick={handleAssign}>
                  Save & Mark Ready
                </Button>
                
                {order.status === "ready" && (
                  <Button className="w-full mt-2" variant="outline" onClick={() => { onUpdate(order.id, "shipped"); toast.success("Order Shipped!"); setOpen(false); }}>
                    Mark Shipped (In Transit)
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineStep({ active, title, subtitle }: { active: boolean; title: string; subtitle?: string }) {
  return (
    <div className="relative">
      <div className={cn("absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-background", active ? "bg-brand" : "bg-muted")}></div>
      <div className={cn("font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{title}</div>
      {subtitle && <div className="text-muted-foreground text-xs">{subtitle}</div>}
    </div>
  );
}
