import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  CartItem,
  Coupon,
  Order,
  OrderItem,
  PaymentMethod,
  ShippingAddress,
} from "@/types/commerce";
import {
  computeTotals,
  estimatedDeliveryDate,
  generateInvoiceNumber,
  generateOrderNumber,
  DELIVERY_PARTNERS,
} from "@/lib/commerce";
import { toast } from "sonner";

export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async (): Promise<Order | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Order | null;
    },
  });
}

export type PlaceOrderInput = {
  items: CartItem[];
  address: ShippingAddress;
  coupon: Coupon | null;
  payment_method: PaymentMethod;
};

export function usePlaceOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ items, address, coupon, payment_method }: PlaceOrderInput) => {
      if (!user) throw new Error("Please sign in");
      if (!items.length) throw new Error("Cart is empty");

      const totals = computeTotals(items, address, coupon);
      const order_number = generateOrderNumber();
      const delivery_partner =
        DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];
      const tracking_number = "TRK" + Math.random().toString(36).slice(2, 10).toUpperCase();
      const now = new Date().toISOString();
      const status_history = [
        { status: "pending", at: now, note: "Order created" },
        { status: "confirmed", at: now, note: "Payment received" },
      ];

      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number,
          user_id: user.id,
          status: "confirmed",
          shipping_address: address as never,
          subtotal: totals.subtotal,
          discount_total: totals.discountTotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          igst: totals.igst,
          gst_total: totals.gstTotal,
          shipping_total: totals.shippingTotal,
          grand_total: totals.grandTotal,
          coupon_code: coupon?.code ?? null,
          coupon_id: coupon?.id ?? null,
          payment_method,
          payment_status: payment_method === "cod" ? "pending" : "success",
          status_history: status_history as never,
          estimated_delivery: estimatedDeliveryDate(5),
          tracking_number,
          delivery_partner,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;
      const order = orderData as unknown as Order;

      const itemRows = items.map((i) => {
        const line = i.product_snapshot.wholesalePrice * i.quantity;
        const share = totals.subtotal > 0 ? line / totals.subtotal : 0;
        const disc = totals.discountTotal * share;
        const taxable = line - disc;
        const rate = i.product_snapshot.gstRate;
        const gst = i.product_snapshot.gstIncluded
          ? taxable - taxable / (1 + rate / 100)
          : (taxable * rate) / 100;
        return {
          order_id: order.id,
          product_id: i.product_id,
          product_snapshot: i.product_snapshot as never,
          quantity: i.quantity,
          unit_price: i.product_snapshot.wholesalePrice,
          gst_rate: rate,
          gst_amount: round(gst),
          discount_amount: round(disc),
          line_total: round(i.product_snapshot.gstIncluded ? taxable + 0 : taxable + gst),
        };
      }) satisfies Partial<OrderItem>[] as never[];

      const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
      if (itemsErr) throw itemsErr;

      await supabase.from("payment_records").insert({
        order_id: order.id,
        user_id: user.id,
        method: payment_method,
        status: payment_method === "cod" ? "pending" : "success",
        amount: totals.grandTotal,
        transaction_ref: "DEMO-" + Math.random().toString(36).slice(2, 12).toUpperCase(),
        gateway: "demo",
      });

      await supabase.from("invoices").insert({
        order_id: order.id,
        user_id: user.id,
        invoice_number: generateInvoiceNumber(),
        amount: totals.grandTotal,
        gst_amount: totals.gstTotal,
      });

      // Clear the cart
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("saved_for_later", false);

      return order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not place order"),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("orders")
        .select("status_history")
        .eq("id", id)
        .single();
      const hist = ((current?.status_history as unknown as Array<Record<string, unknown>>) ?? []).concat([
        { status: "cancelled", at: new Date().toISOString(), note: "Cancelled by buyer" },
      ]);
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", status_history: hist as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order cancelled");
    },
  });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
