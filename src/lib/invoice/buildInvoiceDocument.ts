import type { Order } from "@/types/commerce";
import { VYAPARSETU_BILLING } from "@/lib/invoice/constants";
import type { InvoiceBuildInput, InvoiceDocument, InvoiceLineItem } from "@/lib/invoice/types";

const HSN_BY_CATEGORY: Record<string, string> = {
  "food-grains": "1006",
  spices: "0904",
  "pulses-dal": "0713",
  "salt-sugar": "2501",
  beverages: "2202",
  "personal-care": "3304",
  "home-care": "3401",
  snacks: "1905",
};

function defaultHsn(category?: string) {
  if (!category) return "996812";
  return HSN_BY_CATEGORY[category] ?? "996812";
}

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n);
}

export function buildInvoiceDocument(input: InvoiceBuildInput): InvoiceDocument {
  const { order, invoiceNumber, issuedAt, buyerGstin, buyerBusinessName } = input;
  const addr = order.shipping_address;
  const isInterstate = order.igst > 0;
  const primarySupplier =
    order.order_items?.[0]?.product_snapshot.supplierName ?? "Verified Supplier";

  const items: InvoiceLineItem[] = (order.order_items ?? []).map((it, idx) => {
    const snap = it.product_snapshot;
    const taxable =
      snap.gstIncluded && it.gst_amount > 0
        ? it.line_total - it.gst_amount
        : it.unit_price * it.quantity - it.discount_amount;

    const halfGst = isInterstate ? 0 : it.gst_amount / 2;

    return {
      sno: idx + 1,
      description: `${snap.name}${snap.brand ? ` (${snap.brand})` : ""}`,
      hsn: defaultHsn(snap.category),
      quantity: it.quantity,
      unit: snap.unit,
      unitPrice: it.unit_price,
      taxableValue: taxable,
      gstRate: it.gst_rate,
      cgstAmount: isInterstate ? 0 : halfGst,
      sgstAmount: isInterstate ? 0 : halfGst,
      igstAmount: isInterstate ? it.gst_amount : 0,
      lineTotal: it.line_total,
    };
  });

  return {
    invoiceNumber,
    invoiceDate: new Date(issuedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    placeOfSupply: addr.state,
    isInterstate,
    seller: {
      name: `${primarySupplier} via ${VYAPARSETU_BILLING.tradeName}`,
      addressLines: [
        VYAPARSETU_BILLING.addressLine1,
        VYAPARSETU_BILLING.addressLine2,
        `GSTIN: ${VYAPARSETU_BILLING.gstin}`,
      ],
      gstin: VYAPARSETU_BILLING.gstin,
      state: VYAPARSETU_BILLING.state,
      phone: VYAPARSETU_BILLING.phone,
    },
    buyer: {
      name: buyerBusinessName || addr.contact_name,
      addressLines: [
        addr.line1,
        addr.line2,
        `${addr.city}, ${addr.state} — ${addr.pincode}`,
        buyerGstin ? `GSTIN: ${buyerGstin}` : addr.gst_number ? `GSTIN: ${addr.gst_number}` : "",
      ].filter(Boolean) as string[],
      gstin: buyerGstin ?? addr.gst_number ?? null,
      state: addr.state,
      phone: addr.phone,
    },
    items,
    subtotal: order.subtotal,
    discountTotal: order.discount_total,
    couponCode: order.coupon_code,
    cgst: order.cgst,
    sgst: order.sgst,
    igst: order.igst,
    gstTotal: order.gst_total,
    shippingTotal: order.shipping_total,
    grandTotal: order.grand_total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
  };
}

export { formatInr };
