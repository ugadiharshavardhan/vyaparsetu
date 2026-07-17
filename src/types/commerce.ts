import type { Product } from ".";

export type ProductSnapshot = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "brand"
  | "image"
  | "wholesalePrice"
  | "mrp"
  | "moq"
  | "unit"
  | "gstRate"
  | "gstIncluded"
  | "stockCount"
  | "category"
> & {
  supplierName: string;
  supplierId: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  product_snapshot: ProductSnapshot;
  quantity: number;
  saved_for_later: boolean;
  /** Buyer asked the seller to include a sample of this item with the order. */
  sample_requested: boolean;
  created_at: string;
  updated_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product_snapshot: ProductSnapshot;
  created_at: string;
};

export type AddressType = "home" | "business" | "warehouse";

export type ShippingAddress = {
  id: string;
  user_id: string;
  label: string | null;
  type: AddressType;
  contact_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gst_number: string | null;
  is_default: boolean;
  /** Leaflet map pin (optional) */
  latitude?: number | null;
  longitude?: number | null;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  valid_until: string | null;
  is_active: boolean;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export type PaymentMethod = "upi" | "netbanking" | "credit_card" | "debit_card" | "wallet" | "cod";
export type PaymentStatus = "pending" | "processing" | "success" | "failed" | "refunded";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_snapshot: ProductSnapshot;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  discount_amount: number;
  line_total: number;
  sample_requested: boolean;
  buyed_id: string;
  seller_id: string | null;
  seller_order_id: string | null;
};

export type StatusHistoryEntry = { status: OrderStatus; at: string; note?: string };

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_total: number;
  cgst: number;
  sgst: number;
  igst: number;
  gst_total: number;
  shipping_total: number;
  grand_total: number;
  coupon_code: string | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  status_history: StatusHistoryEntry[];
  estimated_delivery: string | null;
  tracking_number: string | null;
  delivery_partner: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type PriceBreakup = {
  subtotal: number;
  discountTotal: number;
  taxableBase: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstTotal: number;
  shippingTotal: number;
  grandTotal: number;
  interstate: boolean;
};
