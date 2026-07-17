import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2, MapPin, Plus, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { PriceSummary } from "@/components/cart/PriceSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressFormDialog } from "@/components/address/AddressForm";
import { useAddresses, useDeleteAddress } from "@/hooks/useAddresses";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useValidateCoupon } from "@/hooks/useCoupon";
import { useProductsByIds } from "@/hooks/useCatalog";
import { computeTotals, DELIVERY_PARTNERS, estimatedDeliveryDate } from "@/lib/commerce";
import { findBelowMoqItems, moqErrorMessage } from "@/lib/moq";
import {
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from "@/lib/razorpay";
import { inr } from "@/lib/format";
import type { Coupon, PaymentMethod } from "@/types/commerce";
import { toast } from "sonner";

const search = z.object({
  coupon: z.string().optional(),
  buyNowProductId: z.string().optional(),
  buyNowQuantity: z.number().optional(),
});

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
  const { coupon: couponCode, buyNowProductId, buyNowQuantity } = Route.useSearch();
  const { data: cart = [], isLoading: cartLoading, isFetching: cartFetching } = useCart();
  const { data: buyNowProducts = [], isLoading: buyNowLoading } = useProductsByIds(
    buyNowProductId ? [buyNowProductId] : undefined
  );

  const buyNowProduct = buyNowProducts?.[0] ?? null;

  const items = useMemo(() => {
    if (buyNowProductId && buyNowProduct) {
      return [
        {
          id: "buynow",
          product_id: buyNowProduct.id,
          quantity: buyNowQuantity ?? 1,
          product_snapshot: {
            id: buyNowProduct.id,
            image: buyNowProduct.image,
            name: buyNowProduct.name,
            wholesalePrice: buyNowProduct.wholesalePrice,
            gstRate: buyNowProduct.gstRate,
            unit: buyNowProduct.unit,
            gstIncluded: buyNowProduct.gstIncluded,
          },
        },
      ] as any[];
    }
    return cart.filter((i) => !i.saved_for_later);
  }, [buyNowProductId, buyNowProduct, buyNowQuantity, cart]);

  const isLoading = cartLoading || cartFetching || (!!buyNowProductId && buyNowLoading);

  const { data: addresses = [] } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [processingMethod, setProcessingMethod] = useState<PaymentMethod | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState<number>(0);

  const address = addresses.find((a) => a.id === selectedAddress) ?? null;
  const breakup = useMemo(() => computeTotals(items, address, coupon), [items, address, coupon]);
  const belowMoq = useMemo(() => findBelowMoqItems(items as any[]), [items]);

  const validate = useValidateCoupon();
  const place = usePlaceOrder();

  // Preselect default address; prompt for address when none saved
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddress(def.id);
    }
  }, [addresses, selectedAddress]);

  const [promptedAddress, setPromptedAddress] = useState(false);
  useEffect(() => {
    if (!isLoading && !promptedAddress && addresses.length === 0 && step === 0) {
      setAddrOpen(true);
      setPromptedAddress(true);
    }
  }, [isLoading, promptedAddress, addresses.length, step]);

  // Restore coupon from URL
  useEffect(() => {
    if (couponCode && !coupon) {
      const subtotal = items.reduce((s, i) => s + i.product_snapshot.wholesalePrice * i.quantity, 0);
      if (subtotal > 0) validate.mutate({ code: couponCode, subtotal }, { onSuccess: setCoupon });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, items.length]);

  if (isLoading && step < 3) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (items.length === 0 && step < 3) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products from the marketplace, then come back to checkout.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate({ to: "/cart" })}>
            Back to cart
          </Button>
        </div>
      </div>
    );
  }

  const next = () => {
    if (belowMoq.length > 0) {
      toast.error(moqErrorMessage(belowMoq[0]));
      return;
    }
    if (step === 0 && !address) {
      toast.error("Please select a shipping address");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleRemoveAddress = (id: string) => {
    deleteAddress.mutate(id, {
      onSuccess: () => {
        if (selectedAddress === id) {
          const remaining = addresses.filter((a) => a.id !== id);
          setSelectedAddress(remaining[0]?.id ?? null);
        }
      },
    });
  };

  const finalizeOrder = (
    method: PaymentMethod,
    razorpay?: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    } | null,
  ) =>
    new Promise<void>((resolve) => {
      place.mutate(
        {
          items,
          address: address!,
          coupon,
          payment_method: method,
          isBuyNow: !!buyNowProductId,
          razorpay: razorpay ?? null,
        },
        {
          onSuccess: (order) => {
            setPlacedOrderId(order.id);
            setPlacedOrderNumber(order.order_number);
            setPlacedTotal(Number(order.grand_total) || breakup.grandTotal);
            setStep(3);
          },
          onSettled: () => {
            setProcessingMethod(null);
            resolve();
          },
        },
      );
    });

  const payWithCod = () => {
    if (belowMoq.length > 0) {
      toast.error(moqErrorMessage(belowMoq[0]));
      return;
    }
    if (!address) {
      toast.error("Please select a shipping address");
      return;
    }
    if (breakup.grandTotal > 50000) {
      toast.error("Cash on delivery is available only for orders under ₹50,000");
      return;
    }
    setProcessingMethod("cod");
    void finalizeOrder("cod");
  };

  const payWithRazorpay = async () => {
    if (belowMoq.length > 0) {
      toast.error(moqErrorMessage(belowMoq[0]));
      return;
    }
    if (!address) {
      toast.error("Please select a shipping address");
      return;
    }
    setProcessingMethod("upi");
    try {
      const rzpOrder = await createRazorpayOrder({
        amount: breakup.grandTotal,
        receipt: `vs_${Date.now()}`,
        notes: { buyer: user?.email ?? "", city: address.city },
      });

      const success = await openRazorpayCheckout({
        order: rzpOrder,
        description: `VyaparSetu order · ${items.length} item(s)`,
        prefill: {
          name: address.contact_name,
          email: user?.email ?? undefined,
          contact: address.phone,
        },
      });

      if (!success) {
        setProcessingMethod(null);
        toast.message("Payment cancelled");
        return;
      }

      const { valid } = await verifyRazorpayPayment(success);
      if (!valid) {
        setProcessingMethod(null);
        toast.error("Payment could not be verified. You were not charged.");
        return;
      }

      await finalizeOrder("upi", success);
    } catch (e) {
      setProcessingMethod(null);
      toast.error(e instanceof Error ? e.message : "Payment failed");
    }
  };

  const partner = DELIVERY_PARTNERS[0];
  const eta = estimatedDeliveryDate(5);

  return (
    <>
      <div className="container-page py-8">

        <div className="mb-8">
          <CheckoutStepper steps={STEPS} current={step} />
        </div>

        <div className={step < 3 ? "grid gap-6 lg:grid-cols-[1fr_360px]" : ""}>
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
                          onDelete={() => handleRemoveAddress(a.id)}
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
                            <div className="line-clamp-1 text-sm font-medium">
                              {it.product_snapshot.name}
                              {it.product_snapshot.isSample && (
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                  SAMPLE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {it.quantity} × {inr(it.product_snapshot.wholesalePrice)}
                              {it.product_snapshot.isSample
                                ? " · flat sample charge"
                                : ` · GST ${it.product_snapshot.gstRate}%`}
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
                    <p className="text-xs text-muted-foreground">
                      Choose how you&apos;d like to pay for this order.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!!processingMethod || place.isPending || breakup.grandTotal > 50000}
                      onClick={payWithCod}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-brand/50 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-foreground">
                        {processingMethod === "cod" ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Truck className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold">Cash on delivery</div>
                        <div className="text-[11px] text-muted-foreground">
                          {breakup.grandTotal > 50000
                            ? "Unavailable above ₹50,000"
                            : "Pay in cash when your order arrives"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={!!processingMethod || place.isPending}
                      onClick={payWithRazorpay}
                      className="flex items-center gap-4 rounded-2xl border border-brand bg-brand/5 p-5 text-left transition-all hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white">
                        {processingMethod === "upi" ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <CreditCard className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold">Continue with Razorpay</div>
                        <div className="text-[11px] text-muted-foreground">
                          UPI, cards, net banking &amp; wallets
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    Payments are 256-bit encrypted and processed securely by Razorpay.
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-elevated"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                  >
                    <Check className="h-10 w-10" strokeWidth={3} />
                  </motion.div>
                  <h3 className="mt-4 text-2xl font-bold">Order placed successfully!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Order <span className="font-semibold text-foreground">#{placedOrderNumber}</span> · {inr(placedTotal)}
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
                {step < 2 && (
                  <Button className="shadow-brand" onClick={next}>
                    Continue <ArrowRight className="ml-1.5 h-4 w-4" />
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
    </>
  );
}

