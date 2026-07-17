import { buildSellerInvoiceDocument } from "@/lib/invoice/buildSellerInvoiceDocument";
import { downloadInvoiceHtml } from "@/lib/invoice/downloadInvoice";
import { renderInvoiceHtml } from "@/lib/invoice/renderInvoiceHtml";
import type { SupplierOrder } from "@/types/supplier";

/**
 * Build + download a GST tax invoice for a seller order (client-side HTML).
 * Pass `items` when the order has multiple product lines from this seller so
 * they all appear on the same invoice.
 */
export function downloadSellerInvoice(
  order: SupplierOrder,
  opts?: { sellerName?: string | null; items?: SupplierOrder[] },
) {
  const doc = buildSellerInvoiceDocument(order, { sellerName: opts?.sellerName, items: opts?.items });
  const html = renderInvoiceHtml(doc);
  downloadInvoiceHtml(html, doc.invoiceNumber);
}
