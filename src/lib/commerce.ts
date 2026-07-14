import type { CartItem, Coupon, PriceBreakup, ProductSnapshot, ShippingAddress } from "@/types/commerce";
import type { Product } from "@/types";

const SELLER_STATE = "Maharashtra";

export function toSnapshot(p: Product): ProductSnapshot {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    image: p.image,
    wholesalePrice: p.wholesalePrice,
    mrp: p.mrp,
    moq: p.moq,
    unit: p.unit,
    gstRate: p.gstRate,
    gstIncluded: p.gstIncluded,
    stockCount: p.stockCount,
    supplierName: p.supplier.name,
    supplierId: p.supplier.id,
  };
}

export function lineNet(item: CartItem) {
  return item.product_snapshot.wholesalePrice * item.quantity;
}

export function estimateShipping(subtotal: number) {
  if (subtotal === 0) return 0;
  if (subtotal >= 10000) return 0;
  if (subtotal >= 5000) return 199;
  return 349;
}

export function applyCoupon(subtotal: number, coupon: Coupon | null) {
  if (!coupon) return 0;
  if (subtotal < coupon.min_order_value) return 0;
  let disc = coupon.discount_type === "percentage"
    ? (subtotal * coupon.discount_value) / 100
    : coupon.discount_value;
  if (coupon.max_discount) disc = Math.min(disc, coupon.max_discount);
  return Math.min(disc, subtotal);
}

export function computeTotals(
  items: CartItem[],
  address: ShippingAddress | null,
  coupon: Coupon | null,
): PriceBreakup {
  const safeItems = items.filter((i) => i?.product_snapshot && typeof i.product_snapshot.wholesalePrice === "number");
  const subtotal = safeItems.reduce((s, i) => s + lineNet(i), 0);
  const discountTotal = applyCoupon(subtotal, coupon);
  const taxableBase = Math.max(subtotal - discountTotal, 0);

  // Weighted GST rate based on line items
  const gstTotal = safeItems.reduce((s, i) => {
    const line = lineNet(i);
    const share = subtotal > 0 ? line / subtotal : 0;
    const taxable = taxableBase * share;
    // treat gstIncluded=true snapshots as tax-inclusive prices
    const rate = i.product_snapshot.gstRate || 0;
    const gst = i.product_snapshot.gstIncluded
      ? taxable - taxable / (1 + rate / 100)
      : (taxable * rate) / 100;
    return s + gst;
  }, 0);

  const interstate = !!address && address.state.toLowerCase() !== SELLER_STATE.toLowerCase();
  const cgst = interstate ? 0 : gstTotal / 2;
  const sgst = interstate ? 0 : gstTotal / 2;
  const igst = interstate ? gstTotal : 0;

  const shippingTotal = estimateShipping(taxableBase);
  const inclusiveSubtotal = safeItems.some((i) => i.product_snapshot.gstIncluded);
  const grandTotal = inclusiveSubtotal
    ? taxableBase + shippingTotal
    : taxableBase + gstTotal + shippingTotal;

  return {
    subtotal: round(subtotal),
    discountTotal: round(discountTotal),
    taxableBase: round(taxableBase),
    cgst: round(cgst),
    sgst: round(sgst),
    igst: round(igst),
    gstTotal: round(gstTotal),
    shippingTotal: round(shippingTotal),
    grandTotal: round(grandTotal),
    interstate,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VS${y}${m}-${rand}`;
}

export function generateInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export function estimatedDeliveryDate(days = 5) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const ORDER_STATUS_FLOW = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Order Placed",
  processing: "Accepted",
  packed: "Packing",
  shipped: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  returned: "Returned",
};

export const DELIVERY_PARTNERS = ["Delhivery", "BlueDart", "Ecom Express", "DTDC"];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Puducherry","Chandigarh","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];
