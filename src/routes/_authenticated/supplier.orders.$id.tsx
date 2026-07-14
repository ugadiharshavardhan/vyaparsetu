import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Package, Printer, CreditCard, User, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/orders/$id")({
  head: (ctx) => ({ meta: [{ title: `Order ${ctx.params.id} — Seller` }] }),
  component: OrderDetailsPage,
});

const STATUS_TONE: Record<string, "warning" | "info" | "success" | "danger" | "muted"> = {
  pending: "warning",
  accepted: "info",
  packing: "info",
  ready: "success",
  picked_up: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  packing: "Packing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  shipped: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

// Simple order timeline stages
const TIMELINE_STAGES = [
  "pending",
  "accepted",
  "packing",
  "ready",
  "picked_up",
  "shipped",
  "delivered"
];

function OrderDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { orders, updateStatus } = useSupplierOrders();
  
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/supplier/orders" })}>Back to Orders</Button>
      </div>
    );
  }

  const currentStageIndex = TIMELINE_STAGES.indexOf(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "returned";

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to="/supplier/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Order ${order.orderNumber}`}
            description={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => toast.info("Printing invoice...")}><Printer className="mr-1.5 h-4 w-4" /> Print Invoice</Button>
                {order.status === "pending" && (
                  <>
                    <Button variant="destructive" onClick={() => { updateStatus(order.id, "cancelled"); toast.success("Order rejected"); }}>Reject</Button>
                    <Button className="bg-brand hover:bg-brand/90" onClick={() => { updateStatus(order.id, "accepted"); toast.success("Order accepted"); }}>Accept Order</Button>
                  </>
                )}
                {order.status === "accepted" && (
                  <Button className="bg-brand hover:bg-brand/90" onClick={() => { updateStatus(order.id, "packing"); toast.success("Started packing"); }}><Package className="mr-1.5 h-4 w-4" /> Start Packing</Button>
                )}
                {order.status === "packing" && (
                  <Button className="bg-success hover:bg-success/90" onClick={() => { updateStatus(order.id, "ready"); toast.success("Marked ready"); }}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Ready for Pickup</Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Pill tone={STATUS_TONE[order.status]} className="text-sm px-3 py-1 font-semibold">{STATUS_LABEL[order.status]}</Pill>
        <Pill tone={order.paymentStatus === "paid" ? "success" : "warning"} className="text-sm px-3 py-1 font-semibold">{order.paymentStatus.toUpperCase()}</Pill>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Products Ordered">
            <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-base">{order.product}</div>
                  <div className="text-sm text-muted-foreground">Qty: {order.qty}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{inr(order.amount)}</div>
                <div className="text-xs text-muted-foreground">{inr(order.amount / order.qty)} / unit</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Order Timeline">
            <div className="relative pl-6 space-y-8 py-2">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border"></div>
              {TIMELINE_STAGES.map((stage, i) => {
                const isPassed = currentStageIndex >= i && !isCancelled;
                const isCurrent = currentStageIndex === i && !isCancelled;
                
                return (
                  <div key={stage} className={cn("relative", !isPassed && "opacity-50")}>
                    <div className={cn(
                      "absolute -left-[30px] h-6 w-6 rounded-full border-2 flex items-center justify-center bg-card",
                      isPassed ? "border-brand text-brand" : "border-muted text-muted-foreground",
                      isCurrent && "border-brand text-brand bg-brand-soft ring-4 ring-brand/10"
                    )}>
                      {isPassed ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                    </div>
                    <div>
                      <div className={cn("font-medium", isCurrent && "text-brand font-bold")}>{STATUS_LABEL[stage]}</div>
                      <div className="text-sm text-muted-foreground">
                        {isCurrent ? "Currently in progress" : isPassed ? "Completed" : "Pending"}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isCancelled && (
                 <div className="relative text-destructive">
                 <div className="absolute -left-[30px] h-6 w-6 rounded-full border-2 border-destructive flex items-center justify-center bg-card">
                   <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                 </div>
                 <div>
                   <div className="font-bold">Order {order.status === "returned" ? "Returned" : "Cancelled"}</div>
                   <div className="text-sm opacity-80">This order workflow has been terminated.</div>
                 </div>
               </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard title="Retailer Information" className="text-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold">
                {order.customer.charAt(0)}
              </div>
              <div>
                <div className="font-bold">{order.customer}</div>
                <Link to="/supplier/customers" className="text-brand text-xs font-semibold hover:underline">View Profile</Link>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>Contact info available in profile</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Delivery Address" className="text-sm">
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{order.destination}</div>
                <div className="text-muted-foreground mt-1">Expected Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : "TBD"}</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payment Information" className="text-sm">
            <div className="flex gap-2 mb-4">
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Method: Bank Transfer / UPI</div>
                <div className="text-muted-foreground">Status: {order.paymentStatus === "paid" ? "Payment Received" : "Payment Pending"}</div>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{inr(order.amount * 0.82)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>{inr(order.amount * 0.18)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{inr(0)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>{inr(order.amount)}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
