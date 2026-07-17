import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Package, FileText, CreditCard, User, CheckCircle2, Mail, FlaskConical, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { useProfile } from "@/hooks/useProfile";
import { useSellerSampleRequests, useSendSampleRequest } from "@/hooks/useSampleRequests";
import { downloadSellerInvoice } from "@/lib/invoice/downloadSellerInvoice";
import type { SupplierOrder } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/orders/$id")({
  head: (ctx) => ({ meta: [{ title: `Order ${ctx.params.id} — Seller` }] }),
  component: OrderDetailsPage,
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn&apos;t load this order</h1>
      <p className="mt-2 text-muted-foreground">Something interrupted the request. Please try again.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button asChild variant="outline">
          <Link to="/supplier/orders">Back to Orders</Link>
        </Button>
      </div>
    </div>
  ),
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

function OrderDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { orders, updateStatus, updatePaymentStatus, isLoading } = useSupplierOrders();
  const { data: profile } = useProfile();
  const { byOrderItem: sampleRequestByItem } = useSellerSampleRequests();
  const sendSampleRequest = useSendSampleRequest();

  const order = orders.find((o) => o.id === id);

  const changeStatus = async (next: SupplierOrder["status"], message: string) => {
    try {
      await updateStatus(id, next);
      toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update order");
    }
  };

  const handleInvoice = () => {
    if (!order) return;
    try {
      const items = order.orderId ? orders.filter((o) => o.orderId === order.orderId) : [order];
      downloadSellerInvoice(order, { sellerName: profile?.business_name, items });
      toast.success("GST invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate invoice");
    }
  };

  if (isLoading && !order) {
    return (
      <div className="container-page space-y-6 py-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/supplier/orders" })}>Back to Orders</Button>
      </div>
    );
  }

  // All line items belonging to the same parent order (from this seller) —
  // a single order can contain several products, each stored as its own
  // order_item row.
  const orderItems = order.orderId ? orders.filter((o) => o.orderId === order.orderId) : [order];
  const orderTotal = orderItems.reduce((sum, it) => sum + it.amount, 0);
  const gstBreakdown = orderItems.reduce(
    (acc, it) => {
      const rate = it.gstRate ?? 18;
      const taxable = it.gstIncluded !== false ? it.amount / (1 + rate / 100) : it.amount;
      const gst = it.gstIncluded !== false ? it.amount - taxable : it.amount * (rate / 100);
      acc.taxable += taxable;
      acc.gst += gst;
      return acc;
    },
    { taxable: 0, gst: 0 },
  );

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-full border border-border/40 hover:bg-muted/30 shrink-0">
          <Link to="/supplier/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Order ${order.orderNumber}`}
            description={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-full border-border/60 hover:bg-muted/40 h-10 px-5 text-sm" onClick={handleInvoice}><FileText className="mr-1.5 h-4 w-4" /> Download Invoice</Button>
                {order.status === "pending" && (
                  <>
                    <Button variant="destructive" className="rounded-full h-10 px-5 text-sm font-semibold" onClick={() => changeStatus("cancelled", "Order rejected")}>Reject</Button>
                    <Button className="bg-brand hover:bg-brand/90 rounded-full h-10 px-5 shadow-brand text-white text-sm font-semibold" onClick={() => changeStatus("accepted", "Order accepted")}>Accept Order</Button>
                  </>
                )}
                {order.status === "accepted" && (
                  <Button className="bg-brand hover:bg-brand/90 rounded-full h-10 px-5 shadow-brand text-white text-sm font-semibold" onClick={() => changeStatus("packing", "Started packing")}><Package className="mr-1.5 h-4 w-4" /> Start Packing</Button>
                )}
                {order.status === "packing" && (
                  <Button className="bg-success hover:bg-success/90 rounded-full h-10 px-5 shadow-brand text-white text-sm font-semibold" onClick={() => changeStatus("ready", "Marked ready")}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Ready for Pickup</Button>
                )}
                {!["delivered", "cancelled", "returned"].includes(order.status) && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-10 px-5 text-white text-sm font-semibold" onClick={() => changeStatus("delivered", "Order marked as delivered")}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark as Delivered</Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Pill tone={STATUS_TONE[order.status]} className="text-sm px-3 py-1 font-semibold">{STATUS_LABEL[order.status]}</Pill>
        <button
          type="button"
          className="cursor-pointer rounded-full transition-transform hover:scale-105"
          title={order.paymentStatus === "paid" ? "Click to mark payment as pending" : "Click to mark payment as completed"}
          onClick={async () => {
            const next = order.paymentStatus === "paid" ? "pending" : "paid";
            try {
              await updatePaymentStatus(order.id, next);
              toast.success(next === "paid" ? "Payment marked as completed" : "Payment marked as pending");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not update payment status");
            }
          }}
        >
          <Pill tone={order.paymentStatus === "paid" ? "success" : "warning"} className="text-sm px-3 py-1 font-semibold">
            {order.paymentStatus === "paid" ? "COMPLETED" : "PENDING"}
          </Pill>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title={`Products Ordered${orderItems.length > 1 ? ` (${orderItems.length})` : ""}`} className="border-border/50 shadow-soft">
            {orderItems.map((item) => {
              const sampleReq = sampleRequestByItem.get(item.id);
              return (
                <div key={item.id} className="py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {item.product}
                          {item.isSample && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                              Sample order
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{inr(item.amount)}</div>
                      <div className="text-xs text-muted-foreground">{inr(item.amount / (item.qty || 1))} / unit</div>
                    </div>
                  </div>

                  {(item.sampleRequested || item.isSample) && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-amber-800">
                        <FlaskConical className="h-4 w-4 shrink-0" />
                        <span>
                          {item.isSample
                            ? "Paid ₹100 sample order — ship the sample, then ask the buyer to approve."
                            : "Sample requested — ship the sample 1–2 days before the final delivery."}
                        </span>
                      </div>
                      {!sampleReq && item.isSample && item.status !== "delivered" && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          Mark the sample as delivered first, then send the approval request
                        </span>
                      )}
                      {!sampleReq && (!item.isSample || item.status === "delivered") && (
                        <Button
                          size="sm"
                          className="h-8 rounded-full bg-brand px-4 text-xs font-semibold text-white hover:bg-brand/90"
                          disabled={sendSampleRequest.isPending || !item.orderId || !item.buyerId}
                          onClick={() => {
                            if (!item.orderId || !item.buyerId) {
                              toast.error("Buyer details are missing for this line");
                              return;
                            }
                            sendSampleRequest.mutate({
                              orderId: item.orderId,
                              orderItemId: item.id,
                              buyerId: item.buyerId,
                              orderNumber: item.orderNumber,
                              productName: item.product,
                              sellerName: profile?.business_name ?? undefined,
                            });
                          }}
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Send approval request
                        </Button>
                      )}
                      {sampleReq?.status === "sent" && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800">
                          Request sent — awaiting buyer approval
                        </span>
                      )}
                      {sampleReq?.status === "approved" && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                          Approved by buyer — order finalized
                        </span>
                      )}
                      {sampleReq?.status === "rejected" && (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
                          Declined by buyer after checking the sample
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard title="Retailer Information" className="text-sm border-border/50 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold shrink-0">
                {(order.buyerBusiness || order.buyerName || order.customer).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">{order.buyerBusiness || order.customer}</div>
                {order.buyerName && order.buyerName !== (order.buyerBusiness || order.customer) && (
                  <div className="text-xs text-muted-foreground truncate">{order.buyerName}</div>
                )}
                <Link to="/supplier/customers" className="text-brand text-xs font-semibold hover:underline">View Profile</Link>
              </div>
            </div>

            <div className="space-y-3">
              {order.buyerEmail ? (
                <a href={`mailto:${order.buyerEmail}`} className="flex items-center gap-2 text-foreground hover:text-brand">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{order.buyerEmail}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" />
                  <span>Retailer since first order</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Delivery Address" className="text-sm border-border/50 shadow-soft">
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{order.destination}</div>
                <div className="text-muted-foreground mt-1">Expected Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : "TBD"}</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payment Information" className="text-sm border-border/50 shadow-soft">
            <div className="flex gap-2 mb-4">
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Method: Bank Transfer / UPI</div>
                <div className="text-muted-foreground">Status: {order.paymentStatus === "paid" ? "Payment Received" : "Payment Pending"}</div>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{inr(gstBreakdown.taxable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>{inr(gstBreakdown.gst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{inr(0)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border/50">
                <span>Total</span>
                <span>{inr(orderTotal)}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
