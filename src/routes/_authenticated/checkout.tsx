import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, MapPin, Plus, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { PaymentMethodPicker } from "@/components/checkout/PaymentCard";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressFormDialog } from "@/components/address/AddressForm";
import { useAddresses } from "@/hooks/useAddresses";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { computeTotals, DELIVERY_PARTNERS, estimatedDeliveryDate } from "@/lib/commerce";
import { inr } from "@/lib/format";
import type { Coupon, PaymentMethod, ShippingAddress } from "@/types/commerce";
import { toast } from "sonner";

const search = z.object({ coupon: z.string().optional() });

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — VyaparSetu" }] }),
  validateSearch: search,
  component: CheckoutPage,
});

const STEPS = [
  { key: "address", label: "Address" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
  { key: "confirm", label: "Confirmation" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { coupon: couponCode } = Route.useSearch();
  const { data: cart = [] } = useCart();
  const items = cart.filter((i) => !i.saved_for_later);
  const { data: addresses = [] } = useAddresses();

  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);

  const address = addresses.find((a) => a.id === selectedAddress) ?? null;
  const breakup = useMemo(() => computeTotals(items, address, coupon), [items, address, coupon]);

  const validate = useValidateCoupon();
  const place = usePlaceOrder();

  // Preselect default address
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddress(def.id);
    }
  }, [addresses, selectedAddress]);

  // Restore coupon from URL
  useEffect(() => {
    if (couponCode && !coupon) {
      const subtotal = items.reduce((s, i) => s + i.product_snapshot.wholesalePrice * i.quantity, 0);
      if (subtotal > 0) validate.mutate({ code: couponCode, subtotal }, { onSuccess: setCoupon });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, items.length]);

  if (items.length === 0 && step < 3) {
    return (
      
        <div className="container-page py-16 text-center">
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <Button className="mt-4 shadow-brand" onClick={() => navigate({ to: "/marketplace" })}>
            Browse marketplace
          </Button>
        </div>
      
    );
  }

  const next = () => {
    if (step === 0 && !address) {
      toast.error("Please select a shipping address");
      return;
    }
    if (step === 2 && !payment) {
      toast.error("Please select a payment method");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submitPayment = () => {
    if (!address || !payment) return;
    setProcessingPayment(true);
    // Simulated payment gateway
    setTimeout(() => {
      place.mutate(
        { items, address, coupon, payment_method: payment },
        {
          onSuccess: (order) => {
            setPlacedOrderId(order.id);
            setPlacedOrderNumber(order.order_number);
            setStep(3);
          },
          onSettled: () => setProcessingPayment(false),
        },
      );
    }, 1200);
  };

  const partner = DELIVERY_PARTNERS[0];
  const eta = estimatedDeliveryDate(5);

  return (
    <>
      <div className="container-page py-8">

        <div className="mb-8">
          <CheckoutStepper steps={STEPS} current={step} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.section
                  key="address"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold">Shipping address</h3>
                      <p className="text-xs text-muted-foreground">Where should we deliver your order?</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAddrOpen(true)}>
                      <Plus className="mr-1.5 h-4 w-4" /> Add new
                    </Button>
                  </div>
                  {addresses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm">No addresses saved yet.</p>
                      <Button className="mt-3 shadow-brand" onClick={() => setAddrOpen(true)}>
                        Add address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses.map((a) => (
                        <AddressCard
                          key={a.id}
                          address={a}
                          selected={selectedAddress === a.id}
                          onSelect={() => setSelectedAddress(a.id)}
                        />
                      ))}
                    </div>
                  )}
                </motion.section>
              )}

              {step === 1 && (
                <motion.section
                  key="review"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <h3 className="mb-3 text-base font-bold">Order review</h3>
                    <div className="divide-y divide-border">
                      {items.map((it) => (
                        <div key={it.id} className="flex items-center gap-3 py-3">
                          <img src={it.product_snapshot.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="line-clamp-1 text-sm font-medium">{it.product_snapshot.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {it.quantity} × {inr(it.product_snapshot.wholesalePrice)} · GST {it.product_snapshot.gstRate}%
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {inr(it.product_snapshot.wholesalePrice * it.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Truck className="h-4 w-4 text-brand" /> Shipping estimate
                    </div>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery partner</span><span className="font-medium">{partner}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Estimated delivery</span><span className="font-medium">{new Date(eta).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping charges</span><span className="font-medium">{breakup.shippingTotal === 0 ? "FREE" : inr(breakup.shippingTotal)}</span></div>
                    </div>
                  </div>

                  {address && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                      <div className="mb-2 text-sm font-semibold">Delivering to</div>
                      <div className="text-sm">
                        <div className="font-medium">{address.contact_name}</div>
                        <div className="text-muted-foreground">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
                        </div>
                        <div className="text-muted-foreground">Phone: {address.phone}</div>
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {step === 2 && (
                <motion.section
                  key="payment"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="mb-4">
                    <h3 className="text-base font-bold">Payment method</h3>
                    <p className="text-xs text-muted-foreground">Demo mode — no real charge will be made.</p>
                  </div>
                  <PaymentMethodPicker value={payment} onChange={setPayment} grandTotal={breakup.grandTotal} />
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    Payments are 256-bit encrypted. Razorpay integration ready for production.
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-border bg-card p-10 text-center shadow-elevated"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                  >
                    <Sparkles className="h-10 w-10" />
                  </motion.div>
                  <h3 className="mt-4 text-2xl font-bold">Order placed successfully!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Order <span className="font-semibold text-foreground">#{placedOrderNumber}</span> · {inr(breakup.grandTotal)}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Estimated delivery on{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(eta).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    </span>{" "}
                    via {partner}.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={() => navigate({ to: "/marketplace" })}>
                      Continue shopping
                    </Button>
                    <Button className="shadow-brand" onClick={() => placedOrderId && navigate({ to: "/orders/$id", params: { id: placedOrderId } })}>
                      View order
                    </Button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {step < 3 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                {step < 2 ? (
                  <Button className="shadow-brand" onClick={next}>
                    Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="shadow-brand"
                    disabled={!payment || processingPayment || place.isPending}
                    onClick={submitPayment}
                  >
                    {processingPayment || place.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                      </>
                    ) : (
                      <>Pay {inr(breakup.grandTotal)}</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {step < 3 && (
            <aside className="space-y-4 lg:sticky lg:top-24 lg:h-max">
              <CouponInput
                subtotal={breakup.subtotal}
                coupon={coupon}
                onApply={setCoupon}
                onClear={() => setCoupon(null)}
              />
              <PriceSummary breakup={breakup} itemCount={items.length} />
            </aside>
          )}
        </div>
      </div>
      <AddressFormDialog open={addrOpen} onOpenChange={setAddrOpen} />
    
  );
}
