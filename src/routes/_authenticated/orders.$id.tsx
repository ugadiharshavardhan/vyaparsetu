import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Download, HelpCircle, Package, RotateCcw, Truck, XCircle, Star, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";
import { useRepeatOrder } from "@/hooks/useCart";
import { inr } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/commerce";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProductReviews, useSubmitReview, useDeleteReview } from "@/hooks/useProductReviews";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — VyaparSetu" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const cancel = useCancelOrder();
  const repeat = useRepeatOrder();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      
        <div className="container-page py-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-4 h-96 w-full rounded-2xl" />
        </div>
      
    );
  }

  if (!order) {
    return (
      
        <div className="container-page py-16 text-center">
          <h2 className="text-xl font-bold">Order not found</h2>
          <Button className="mt-4" onClick={() => navigate({ to: "/orders" })}>Back to orders</Button>
        </div>
      
    );
  }

  const items = order.order_items ?? [];
  const canCancel = ["pending", "confirmed", "processing"].includes(order.status);

  const onRepeat = () => {
    repeat.mutate(
      items.map((it) => ({
        product_snapshot: it.product_snapshot,
        quantity: it.quantity,
      })),
      {
        onSuccess: () => {
          void navigate({ to: "/cart" });
        },
      },
    );
  };

  return (
    
      <div className="container-page py-8">
        <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Order #{order.order_number}</div>
            <h1 className="text-2xl font-bold">
              {STATUS_LABELS[order.status]}
            </h1>
            <div className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Invoice generation coming soon")}>
              <Download className="mr-1.5 h-4 w-4" /> Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={repeat.isPending || items.length === 0}
              onClick={onRepeat}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {repeat.isPending ? "Adding…" : "Repeat order"}
            </Button>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => cancel.mutate(order.id)}
                disabled={cancel.isPending}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Cancel order
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Truck className="h-4 w-4 text-brand" /> Order tracking
              </div>
              <OrderTimeline order={order} />
              <div className="mt-6 grid gap-2 rounded-xl bg-secondary/60 p-4 text-xs sm:grid-cols-3">
                <div><div className="text-muted-foreground">Delivery partner</div><div className="font-semibold">{order.delivery_partner ?? "TBD"}</div></div>
                <div><div className="text-muted-foreground">Tracking #</div><div className="font-semibold">{order.tracking_number ?? "TBD"}</div></div>
                <div><div className="text-muted-foreground">Estimated delivery</div><div className="font-semibold">{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}</div></div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4 text-brand" /> Items ({items.length})
              </div>
              <div className="divide-y divide-border">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 py-3">
                    <Link to="/products/$slug" params={{ slug: it.product_snapshot.slug }}>
                      <img src={it.product_snapshot.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to="/products/$slug" params={{ slug: it.product_snapshot.slug }} className="line-clamp-1 text-sm font-medium hover:text-brand">
                        {it.product_snapshot.name}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        Supplier: {it.product_snapshot.supplierName} · {it.quantity} × {inr(it.unit_price)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">GST {it.gst_rate}% · {inr(it.gst_amount)}</div>
                      {!["pending", "cancelled"].includes(order.status) && (
                        <div className="mt-2">
                          <ProductReviewButton productId={it.product_id} productName={it.product_snapshot.name} />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{inr(it.line_total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 text-sm font-semibold">Price breakup</div>
              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={inr(order.subtotal)} />
                {order.discount_total > 0 && <Row label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`} value={`− ${inr(order.discount_total)}`} accent />}
                {order.igst > 0 ? (
                  <Row label="IGST" value={inr(order.igst)} muted />
                ) : (
                  <>
                    <Row label="CGST" value={inr(order.cgst)} muted />
                    <Row label="SGST" value={inr(order.sgst)} muted />
                  </>
                )}
                <Row label="Shipping" value={order.shipping_total === 0 ? "FREE" : inr(order.shipping_total)} muted />
                <div className="border-t border-border pt-2">
                  <Row label="Grand total" value={inr(order.grand_total)} bold />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-2 text-sm font-semibold">Shipping address</div>
              <div className="text-sm">
                <div className="font-medium">{order.shipping_address.contact_name}</div>
                <div className="text-muted-foreground">
                  {order.shipping_address.line1}
                  {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                </div>
                <div className="text-muted-foreground">Phone: {order.shipping_address.phone}</div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-2 text-sm font-semibold">Payment</div>
              <div className="text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium capitalize">{order.payment_method?.replace("_", " ") ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{order.payment_status}</span></div>
              </div>
            </section>

            <a
              href="mailto:support@vyaparsetu.in"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground hover:border-brand hover:text-brand"
            >
              <HelpCircle className="h-4 w-4" /> Need help with this order?
            </a>
          </aside>
        </div>
      </div>
    
  );
}

function Row({ label, value, muted, accent, bold }: { label: string; value: string; muted?: boolean; accent?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={`${bold ? "font-bold text-base" : "font-medium"} ${accent ? "text-emerald-600" : ""}`}>{value}</span>
    </div>
  );
}

function ProductReviewButton({ productId, productName }: { productId: string; productName: string }) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const submitReview = useSubmitReview();
  const deleteReview = useDeleteReview();

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const myReview = reviews?.find((r) => r.buyerId === user?.id);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? "");
    } else if (open) {
      setRating(5);
      setComment("");
    }
  };

  const handleSubmit = async () => {
    try {
      await submitReview.mutateAsync({
        productId,
        rating,
        comment: comment.trim() || null,
      });
      toast.success("Review submitted successfully");
      setIsOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    try {
      await deleteReview.mutateAsync({
        reviewId: myReview.id,
        productId,
      });
      toast.success("Review deleted successfully");
      setIsOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-8 px-2 text-xs">
        <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading…
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {myReview ? (
          <Button variant="outline" size="sm" className="h-8 px-3 rounded-full text-xs font-semibold border-amber-500/20 text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
            ★ {myReview.rating} · Edit Review
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-xs font-semibold text-brand hover:bg-brand-soft/20 transition-colors cursor-pointer">
            Write a Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl max-w-md bg-card border-border shadow-elevated">
        <DialogHeader>
          <DialogTitle>Review {productName}</DialogTitle>
          <DialogDescription>
            Share your experience to help other retailers make informed wholesale purchases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-muted-foreground">Overall Rating</div>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                const active = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="cursor-pointer transition-transform duration-100 hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        active ? "fill-warning text-warning" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feedback Comments</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the product quality, packaging, and supplier dispatch timeline? (Optional)"
              rows={4}
              className="resize-none rounded-xl bg-background border-border"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row sm:justify-between items-center gap-2">
          {myReview ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteReview.isPending}
              className="text-destructive hover:bg-destructive/10 rounded-full h-10 px-4 mr-auto cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-full h-10 px-5 cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitReview.isPending}
              className="rounded-full h-10 px-5 bg-brand hover:bg-brand-dark text-white font-semibold cursor-pointer"
            >
              {submitReview.isPending ? "Saving…" : "Submit Review"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
