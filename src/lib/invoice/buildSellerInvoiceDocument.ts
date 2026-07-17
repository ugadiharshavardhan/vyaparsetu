import { VYAPARSETU_BILLING } from "@/lib/invoice/constants";
import type { InvoiceDocument } from "@/lib/invoice/types";
import type { SupplierOrder } from "@/types/supplier";
import { generateInvoiceNumber } from "@/lib/commerce";

function stateFromDestination(destination: string): string {
  // destination is formatted as "City, State" (see useSupplier.destinationFromAddress)
  const parts = destination.split(",").map((s) => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : destination.trim();
}

/**
 * Build a GST tax-invoice document from one or more seller order lines that
 * belong to the same order (an order can contain several products from the
 * same seller, each stored as its own order_item row).
 */
export function buildSellerInvoiceDocument(
  order: SupplierOrder,
  opts?: { sellerName?: string | null; invoiceNumber?: string; items?: SupplierOrder[] },
): InvoiceDocument {
  const lineItems = opts?.items && opts.items.length > 0 ? opts.items : [order];

  const buyerState = stateFromDestination(order.destination);
  const isInterstate =
    !!buyerState && buyerState.toLowerCase() !== VYAPARSETU_BILLING.state.toLowerCase();

  const invoiceItems = lineItems.map((line, index) => {
    const rate = line.gstRate ?? 18;
    const included = line.gstIncluded ?? true;
    const gross = line.amount;
    const taxable = included ? gross / (1 + rate / 100) : gross;
    const gst = included ? gross - taxable : gross * (rate / 100);
    const grandTotal = included ? gross : gross + gst;
    const halfGst = isInterstate ? 0 : gst / 2;
    const unitPrice = line.qty > 0 ? gross / line.qty : gross;
    return {
      sno: index + 1,
      description: line.product,
      hsn: "996812",
      quantity: line.qty,
      unit: "unit",
      unitPrice,
      taxableValue: taxable,
      gstRate: rate,
      cgstAmount: halfGst,
      sgstAmount: halfGst,
      igstAmount: isInterstate ? gst : 0,
      lineTotal: grandTotal,
    };
  });

  const taxable = invoiceItems.reduce((sum, it) => sum + it.taxableValue, 0);
  const cgst = invoiceItems.reduce((sum, it) => sum + it.cgstAmount, 0);
  const sgst = invoiceItems.reduce((sum, it) => sum + it.sgstAmount, 0);
  const igst = invoiceItems.reduce((sum, it) => sum + it.igstAmount, 0);
  const gst = cgst + sgst + igst;
  const grandTotal = invoiceItems.reduce((sum, it) => sum + it.lineTotal, 0);

  return {
    invoiceNumber: opts?.invoiceNumber ?? generateInvoiceNumber(),
    invoiceDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    placeOfSupply: buyerState || VYAPARSETU_BILLING.state,
    isInterstate,
    seller: {
      name: opts?.sellerName
        ? `${opts.sellerName} via ${VYAPARSETU_BILLING.tradeName}`
        : VYAPARSETU_BILLING.tradeName,
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
      name: order.buyerBusiness || order.customer,
      addressLines: [order.destination].filter(Boolean),
      gstin: null,
      state: buyerState || VYAPARSETU_BILLING.state,
      // Buyer mobile number is hidden from sellers (privacy) — not printed on invoices.
      phone: null,
    },
    items: invoiceItems,
    subtotal: taxable,
    discountTotal: 0,
    couponCode: null,
    cgst,
    sgst,
    igst,
    gstTotal: gst,
    shippingTotal: 0,
    grandTotal,
    paymentMethod: null,
    paymentStatus: order.paymentStatus,
  };
}
