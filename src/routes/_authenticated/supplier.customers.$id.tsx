import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, Mail, Phone, FileText, Package, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierCustomers, useSupplierOrders } from "@/hooks/useSupplier";
import { DataTable } from "@/components/supplier/DataTable";
import type { SupplierOrder } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/customers/$id")({
  head: () => ({ meta: [{ title: "Buyer Profile — Seller" }] }),
  component: BuyerProfilePage,
});

function BuyerProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { customers } = useSupplierCustomers();
  const { orders } = useSupplierOrders();
  
  const buyer = customers.find(c => c.id === id);
  // Mock finding orders for this specific buyer (in real app, we'd filter by buyer ID, here we filter by name for mock simplicity)
  const buyerOrders = orders.filter(o => buyer && o.customer === buyer.business);

  if (!buyer) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">Buyer not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/supplier/customers" })}>Back to Buyers</Button>
      </div>
    );
  }

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to="/supplier/customers"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={buyer.business}
            description={`Customer since ${new Date(buyer.lastOrderAt).getFullYear() - 1}`}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => toast.info("Messaging coming soon")}><Mail className="mr-1.5 h-4 w-4" /> Message</Button>
                <Button variant="outline" onClick={() => toast.info("Downloading statement...")}><FileText className="mr-1.5 h-4 w-4" /> Statement</Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar / Profile Info */}
        <div className="space-y-6">
          <SectionCard>
            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="h-20 w-20 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-3xl mb-4">
                {buyer.business.charAt(0)}
              </div>
              <h2 className="text-xl font-bold">{buyer.business}</h2>
              <p className="text-muted-foreground">{buyer.name}</p>
              <div className="mt-4 flex gap-2">
                <Pill tone={buyer.status === "inactive" ? "muted" : "success"}>{buyer.status === "inactive" ? "Inactive" : "Active"}</Pill>
              </div>
            </div>
            
            <div className="py-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Address</div>
                  <div className="text-muted-foreground">{buyer.address || `${buyer.city}, India`}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Phone</div>
                  <div className="text-muted-foreground">{buyer.phone || "Not provided"}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Email</div>
                  <div className="text-muted-foreground">{buyer.email || "Not provided"}</div>
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
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-bold">{buyer.orders}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Lifetime Value</span>
                <span className="font-bold text-brand">{inr(buyer.spent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Average Order</span>
                <span className="font-bold">{inr(buyer.spent / (buyer.orders || 1))}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Favorite Product</span>
                <span className="font-medium text-right max-w-[150px] truncate" title={buyer.favoriteProduct}>{buyer.favoriteProduct}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Order History" className="p-0 overflow-visible">
            <DataTable<SupplierOrder>
              rows={buyerOrders}
              columns={[
                { key: "id", header: "Order", cell: (o) => <span className="font-semibold">{o.orderNumber}</span> },
                { key: "date", header: "Date", cell: (o) => <span className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</span> },
                { key: "product", header: "Items", cell: (o) => <span className="text-sm">{o.product} <span className="text-muted-foreground">× {o.qty}</span></span> },
                { key: "value", header: "Amount", cell: (o) => <span className="font-semibold">{inr(o.amount)}</span> },
                { key: "status", header: "Status", cell: (o) => <Pill tone={o.status === "delivered" ? "success" : o.status === "cancelled" ? "danger" : "info"}>{o.status}</Pill> },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  cell: (o) => (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/orders/$id", params: { id: o.id } }); }}>View</Button>
                  ),
                },
              ]}
              onRowClick={(o) => navigate({ to: "/supplier/orders/$id", params: { id: o.id } })}
              empty={
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No orders found for this buyer yet.
                </div>
              }
            />
          </SectionCard>

          <SectionCard title="Invoices">
             <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                <ReceiptText className="h-8 w-8 mb-2 opacity-20" />
                Invoices will appear here once orders are processed.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
