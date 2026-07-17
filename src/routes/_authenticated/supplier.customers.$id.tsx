import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, Mail, Phone, FileText, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierCustomers, useSupplierOrders } from "@/hooks/useSupplier";
import { DataTable } from "@/components/supplier/DataTable";
import type { SupplierOrder } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/customers/$id")({
  head: () => ({ meta: [{ title: "Buyer Profile — Seller" }] }),
  component: BuyerProfilePage,
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn&apos;t load this buyer</h1>
      <p className="mt-2 text-muted-foreground">Something interrupted the request. Please try again.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button asChild variant="outline">
          <Link to="/supplier/customers">Back to Buyers</Link>
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

/** One row per parent order (multiple product lines from the same order collapse). */
type BuyerOrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  products: string;
  qty: number;
  amount: number;
  status: SupplierOrder["status"];
  paymentStatus: SupplierOrder["paymentStatus"];
  lineId: string;
};

function BuyerProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { customers, isLoading: buyersLoading } = useSupplierCustomers();
  const { orders, isLoading: ordersLoading } = useSupplierOrders();

  const buyer = customers.find((c) => c.id === id);

  // Only this seller's order lines placed by this buyer.
  const buyerLines = orders.filter((o) => o.buyerId === id);

  // Group line items by parent order so the history shows real orders, not every SKU row.
  const orderMap = new Map<string, BuyerOrderRow>();
  for (const line of buyerLines) {
    const key = line.orderId || line.id;
    const existing = orderMap.get(key);
    if (!existing) {
      orderMap.set(key, {
        id: key,
        orderNumber: line.orderNumber,
        createdAt: line.createdAt,
        products: line.product,
        qty: line.qty,
        amount: line.amount,
        status: line.status,
        paymentStatus: line.paymentStatus,
        lineId: line.id,
      });
    } else {
      existing.products = `${existing.products}, ${line.product}`;
      existing.qty += line.qty;
      existing.amount += line.amount;
    }
  }
  const buyerOrders = Array.from(orderMap.values()).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  const isLoading = (buyersLoading || ordersLoading) && !buyer;

  if (isLoading) {
    return (
      <div className="container-page space-y-6 py-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">Buyer not found</h2>
        <p className="mt-2 text-muted-foreground">This buyer may not have ordered from you, or the link is invalid.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/supplier/customers" })}>Back to Buyers</Button>
      </div>
    );
  }

  const displayBusiness = buyer.business || buyer.name;
  const displayName = buyer.name && buyer.name !== displayBusiness ? buyer.name : null;
  const lifetimeFromOrders = buyerOrders.reduce((s, o) => s + o.amount, 0);
  const orderCount = buyerOrders.length;

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to="/supplier/customers"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={displayBusiness}
            description={displayName ? `Contact: ${displayName}` : `Customer since ${new Date(buyer.lastOrderAt).toLocaleDateString()}`}
            action={
              <div className="flex items-center gap-2">
                {buyer.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${buyer.phone}`}><Phone className="mr-1.5 h-4 w-4" /> Call</a>
                  </Button>
                )}
                {buyer.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${buyer.email}`}><Mail className="mr-1.5 h-4 w-4" /> Email</a>
                  </Button>
                )}
                <Button variant="outline" onClick={() => toast.info("Downloading statement...")}><FileText className="mr-1.5 h-4 w-4" /> Statement</Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard className="p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="h-20 w-20 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-3xl mb-4">
                {displayBusiness.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold">{displayBusiness}</h2>
              {displayName && <p className="text-muted-foreground">{displayName}</p>}
              <div className="mt-4 flex gap-2">
                <Pill tone={buyer.status === "inactive" ? "muted" : "success"}>{buyer.status === "inactive" ? "Inactive" : "Active"}</Pill>
              </div>
            </div>

            <div className="pt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Phone</div>
                  {buyer.phone ? (
                    <a href={`tel:${buyer.phone}`} className="text-brand hover:underline">{buyer.phone}</a>
                  ) : (
                    <div className="text-muted-foreground">Not provided</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div className="min-w-0">
                  <div className="font-medium text-foreground">Email</div>
                  {buyer.email ? (
                    <a href={`mailto:${buyer.email}`} className="text-brand hover:underline break-all">{buyer.email}</a>
                  ) : (
                    <div className="text-muted-foreground">Not provided</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Address</div>
                  <div className="text-muted-foreground">{buyer.address || (buyer.city ? `${buyer.city}, India` : "Not provided")}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">GST Number</div>
                  <div className="text-muted-foreground font-mono">{buyer.gstNumber || "Unregistered"}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Insights">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Orders with you</span>
                <span className="font-bold">{orderCount || buyer.orders}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Lifetime Value</span>
                <span className="font-bold text-brand">{inr(lifetimeFromOrders || buyer.spent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Average Order</span>
                <span className="font-bold">{inr((lifetimeFromOrders || buyer.spent) / (orderCount || buyer.orders || 1))}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Favorite Product</span>
                <span className="font-medium text-right max-w-[150px] truncate" title={buyer.favoriteProduct || undefined}>{buyer.favoriteProduct || "—"}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
            <div className="px-6 py-5 border-b border-border bg-muted/5">
              <h3 className="font-semibold text-base text-foreground">
                Orders with you{orderCount > 0 ? ` (${orderCount})` : ""}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Only orders this buyer placed for your products</p>
            </div>
            <DataTable<BuyerOrderRow>
              rows={buyerOrders}
              embedded={true}
              columns={[
                { key: "id", header: "Order", cell: (o) => <span className="font-semibold">{o.orderNumber}</span> },
                { key: "date", header: "Date", cell: (o) => <span className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</span> },
                {
                  key: "product",
                  header: "Items",
                  cell: (o) => (
                    <div className="flex flex-col max-w-[220px]">
                      <span className="text-sm truncate" title={o.products}>{o.products}</span>
                      <span className="text-xs text-muted-foreground">Qty: {o.qty}</span>
                    </div>
                  ),
                },
                { key: "value", header: "Amount", cell: (o) => <span className="font-semibold">{inr(o.amount)}</span> },
                {
                  key: "payment",
                  header: "Payment",
                  cell: (o) => <Pill tone={o.paymentStatus === "paid" ? "success" : "warning"}>{o.paymentStatus}</Pill>,
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (o) => <Pill tone={STATUS_TONE[o.status] ?? "muted"}>{STATUS_LABEL[o.status] ?? o.status}</Pill>,
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  cell: (o) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: "/supplier/orders/$id", params: { id: o.lineId } });
                      }}
                    >
                      View
                    </Button>
                  ),
                },
              ]}
              onRowClick={(o) => navigate({ to: "/supplier/orders/$id", params: { id: o.lineId } })}
              empty={
                <div className="py-8 text-center text-muted-foreground text-sm">
                  {ordersLoading ? "Loading orders…" : "No orders from this buyer for your products yet."}
                </div>
              }
            />
          </SectionCard>

          <SectionCard title="Invoices">
            <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center">
              <ReceiptText className="h-8 w-8 mb-2 opacity-20" />
              Open an order and use Download Invoice to get a GST tax invoice.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
