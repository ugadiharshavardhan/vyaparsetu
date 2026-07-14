import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clock, Calendar, CheckCircle2, MessageSquare, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierRfqs } from "@/hooks/useSupplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/rfqs/$id")({
  head: (ctx) => ({ meta: [{ title: `Quotation ${ctx.params.id} — Seller` }] }),
  component: RfqDetailsPage,
});

const STATUS_TONE: Record<string, "warning" | "info" | "success" | "danger" | "muted"> = {
  new: "info",
  pending_response: "warning",
  quoted: "success",
  accepted: "success",
  rejected: "danger",
  expired: "muted",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New Request",
  pending_response: "Response Required",
  quoted: "Quoted (Awaiting Buyer)",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

function RfqDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { rfqs, updateStatus } = useSupplierRfqs();
  
  const rfq = rfqs.find(r => r.id === id);

  const [responseMsg, setResponseMsg] = useState("");
  const [offerPrice, setOfferPrice] = useState(rfq?.targetPrice?.toString() || "");
  const [delivery, setDelivery] = useState("5 days");

  if (!rfq) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-2xl font-bold">Quotation request not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/supplier/rfqs" })}>Back to Quotations</Button>
      </div>
    );
  }

  const handleSendQuote = () => {
    const msg = responseMsg || `We can supply ${rfq.qty} units at ${inr(Number(offerPrice))}/unit. Delivery in ${delivery}.`;
    updateStatus(rfq.id, "quoted", msg, delivery);
    toast.success("Quotation sent to buyer successfully!");
  };

  const handleReject = () => {
    updateStatus(rfq.id, "rejected", "We are unable to fulfill this request at the target price.", "");
    toast.success("Quotation rejected.");
  };

  const isPending = rfq.status === "new" || rfq.status === "pending_response";

  return (
    <div className="container-page space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link to="/supplier/rfqs"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={rfq.rfqNumber}
            description={`Requested on ${new Date(rfq.createdAt).toLocaleDateString()}`}
            action={
              <div className="flex items-center gap-2">
                 <Pill tone={STATUS_TONE[rfq.status]} className="text-sm px-3 py-1 font-semibold">{STATUS_LABEL[rfq.status]}</Pill>
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Request Details">
            <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b border-border">
               <div>
                  <div className="text-sm text-muted-foreground mb-1">Product Requested</div>
                  <div className="font-semibold text-lg">{rfq.products}</div>
               </div>
               <div>
                  <div className="text-sm text-muted-foreground mb-1">Quantity</div>
                  <div className="font-semibold text-lg">{rfq.qty} Units</div>
               </div>
               <div>
                  <div className="text-sm text-muted-foreground mb-1">Target Price (Per Unit)</div>
                  <div className="font-semibold text-lg text-brand">{inr(rfq.targetPrice)}</div>
               </div>
               <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Target Value</div>
                  <div className="font-semibold text-lg">{inr(rfq.targetPrice * rfq.qty)}</div>
               </div>
            </div>

            <div className="pt-6">
               <h3 className="text-sm font-semibold mb-4">Retailer Information</h3>
               <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold">
                  {rfq.retailerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{rfq.retailerName}</div>
                  <Link to={`/supplier/customers/${rfq.retailerId}`} className="text-brand text-xs font-semibold hover:underline">View Buyer Profile</Link>
                </div>
              </div>
            </div>
          </SectionCard>

          {isPending ? (
            <SectionCard title="Respond to Quote">
               <div className="space-y-4">
                 <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Offer Price (Per Unit)</label>
                      <Input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estimated Delivery</label>
                      <Input value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="e.g. 5 days, 1 week" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Message to Buyer</label>
                   <Textarea 
                      rows={4} 
                      placeholder="Add any terms, minimum conditions, or a friendly message..."
                      value={responseMsg}
                      onChange={e => setResponseMsg(e.target.value)}
                    />
                 </div>

                 <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="text-destructive" onClick={handleReject}>Reject Request</Button>
                    <Button className="bg-brand hover:bg-brand/90" onClick={handleSendQuote} disabled={!offerPrice}>Send Quotation</Button>
                 </div>
               </div>
            </SectionCard>
          ) : (
            <SectionCard title="Seller Response">
               {rfq.status === "rejected" ? (
                  <div className="flex items-center gap-3 text-destructive p-4 bg-destructive/10 rounded-lg">
                     <XCircle className="h-5 w-5 shrink-0" />
                     <p className="text-sm font-medium">You rejected this quotation request on {new Date().toLocaleDateString()}.</p>
                  </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                       <MessageSquare className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                       <div className="flex-1 text-sm whitespace-pre-wrap">{rfq.sellerResponse}</div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                       <div className="flex items-center gap-2 text-sm">
                         <Clock className="h-4 w-4 text-muted-foreground" />
                         <span className="text-muted-foreground">Delivery:</span>
                         <span className="font-semibold">{rfq.deliveryTimeline || "Not specified"}</span>
                       </div>
                    </div>
                 </div>
               )}
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard title="Timeline" className="text-sm">
            <div className="space-y-4 relative pl-4 border-l-2 border-border ml-2">
               <div className="relative">
                  <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-brand"></div>
                  <div className="font-semibold">RFQ Submitted</div>
                  <div className="text-muted-foreground text-xs">{new Date(rfq.createdAt).toLocaleDateString()}</div>
               </div>
               
               {rfq.status === "quoted" && (
                 <div className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-brand"></div>
                    <div className="font-semibold">Quote Sent</div>
                    <div className="text-muted-foreground text-xs">Waiting for buyer approval</div>
                 </div>
               )}

               {rfq.status === "accepted" && (
                 <div className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-success"></div>
                    <div className="font-semibold text-success">Quote Accepted</div>
                    <div className="text-muted-foreground text-xs">Order generated</div>
                 </div>
               )}

               {rfq.status === "rejected" && (
                 <div className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-destructive"></div>
                    <div className="font-semibold text-destructive">Rejected</div>
                 </div>
               )}
            </div>
          </SectionCard>

          <SectionCard className="bg-muted/10 border-none shadow-none">
             <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="font-semibold text-sm">Expiry Date</span>
             </div>
             <p className="text-sm text-muted-foreground mb-3">This quotation request is valid until:</p>
             <div className="font-bold">{new Date(rfq.expiryDate).toLocaleDateString()}</div>
             {rfq.status === "expired" && (
                <div className="mt-3 text-xs text-destructive font-semibold">This quotation has expired.</div>
             )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
