import { VYAPARSETU_BILLING } from "@/lib/invoice/constants";
import { formatInr } from "@/lib/invoice/buildInvoiceDocument";
import type { InvoiceDocument } from "@/lib/invoice/types";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderInvoiceHtml(doc: InvoiceDocument): string {
  const taxColumns = doc.isInterstate
    ? `<th>IGST</th>`
    : `<th>CGST</th><th>SGST</th>`;

  const itemRows = doc.items
    .map((row) => {
      const taxCells = doc.isInterstate
        ? `<td class="num">${formatInr(row.igstAmount)}<br><span class="muted">${row.gstRate}%</span></td>`
        : `<td class="num">${formatInr(row.cgstAmount)}<br><span class="muted">${row.gstRate / 2}%</span></td>
           <td class="num">${formatInr(row.sgstAmount)}<br><span class="muted">${row.gstRate / 2}%</span></td>`;
      return `<tr>
        <td class="center">${row.sno}</td>
        <td>${esc(row.description)}</td>
        <td class="center">${row.hsn}</td>
        <td class="num">${row.quantity} ${esc(row.unit)}</td>
        <td class="num">${formatInr(row.unitPrice)}</td>
        <td class="num">${formatInr(row.taxableValue)}</td>
        ${taxCells}
        <td class="num strong">${formatInr(row.lineTotal)}</td>
      </tr>`;
    })
    .join("");

  const taxSummary = doc.isInterstate
    ? `<tr><td>IGST</td><td class="num">${formatInr(doc.igst)}</td></tr>`
    : `<tr><td>CGST</td><td class="num">${formatInr(doc.cgst)}</td></tr>
       <tr><td>SGST</td><td class="num">${formatInr(doc.sgst)}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tax Invoice ${esc(doc.invoiceNumber)} — ${VYAPARSETU_BILLING.tradeName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #111; margin: 0; padding: 24px; background: #f5f7f5; }
    .page { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #d8e6d8; border-radius: 12px; overflow: hidden; }
    .brand { background: #1f8f4e; color: #fff; padding: 20px 24px; display: flex; justify-content: space-between; gap: 16px; }
    .brand h1 { margin: 0; font-size: 22px; letter-spacing: 0.02em; }
    .brand p { margin: 4px 0 0; font-size: 12px; opacity: 0.92; }
    .meta { padding: 20px 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { border: 1px solid #e5ece5; border-radius: 10px; padding: 14px 16px; background: #fafcfa; }
    .box h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #5b6b5b; }
    .box .name { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .box p { margin: 0 0 4px; font-size: 12px; line-height: 1.45; color: #333; }
    .invoice-head { padding: 16px 24px 0; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .invoice-head h2 { margin: 0; font-size: 18px; color: #1f8f4e; }
    .invoice-head dl { margin: 0; font-size: 12px; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; }
    .invoice-head dt { color: #666; }
    .invoice-head dd { margin: 0; font-weight: 600; }
    table { width: calc(100% - 48px); margin: 16px 24px 0; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #dfe8df; padding: 8px 6px; vertical-align: top; }
    th { background: #eef6ee; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; color: #4a5c4a; }
    td.num { text-align: right; white-space: nowrap; }
    td.center { text-align: center; }
    td.strong { font-weight: 700; }
    .muted { color: #777; font-size: 10px; }
    .totals-wrap { display: flex; justify-content: flex-end; padding: 16px 24px 24px; }
    .totals { width: 320px; border: 1px solid #dfe8df; border-radius: 10px; overflow: hidden; font-size: 12px; }
    .totals table { width: 100%; margin: 0; }
    .totals td { border: none; border-bottom: 1px solid #eef2ee; padding: 8px 12px; }
    .totals tr:last-child td { border-bottom: none; background: #1f8f4e; color: #fff; font-size: 14px; font-weight: 700; }
    .footer { padding: 0 24px 24px; font-size: 11px; color: #666; line-height: 1.5; }
    .sign { margin-top: 28px; text-align: right; font-size: 12px; }
    @media print {
      body { background: #fff; padding: 0; }
      .page { border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">
      <div>
        <h1>${esc(VYAPARSETU_BILLING.tradeName)}</h1>
        <p>${esc(VYAPARSETU_BILLING.legalName)} · B2B Wholesale Marketplace</p>
      </div>
      <div style="text-align:right;font-size:12px;">
        <div>GSTIN: ${esc(VYAPARSETU_BILLING.gstin)}</div>
        <div>PAN: ${esc(VYAPARSETU_BILLING.pan)}</div>
      </div>
    </div>

    <div class="invoice-head">
      <h2>Tax Invoice</h2>
      <dl>
        <dt>Invoice No.</dt><dd>${esc(doc.invoiceNumber)}</dd>
        <dt>Invoice Date</dt><dd>${esc(doc.invoiceDate)}</dd>
        <dt>Order No.</dt><dd>${esc(doc.orderNumber)}</dd>
        <dt>Order Date</dt><dd>${esc(doc.orderDate)}</dd>
        <dt>Place of Supply</dt><dd>${esc(doc.placeOfSupply)}</dd>
        <dt>Payment</dt><dd>${esc(doc.paymentMethod?.replace("_", " ") ?? "—")} (${esc(doc.paymentStatus)})</dd>
      </dl>
    </div>

    <div class="meta">
      <div class="box">
        <h3>Bill From (Supplier)</h3>
        <div class="name">${esc(doc.seller.name)}</div>
        ${doc.seller.addressLines.map((l) => `<p>${esc(l)}</p>`).join("")}
        <p>State: ${esc(doc.seller.state)}</p>
      </div>
      <div class="box">
        <h3>Bill To (Buyer)</h3>
        <div class="name">${esc(doc.buyer.name)}</div>
        ${doc.buyer.addressLines.map((l) => `<p>${esc(l)}</p>`).join("")}
        <p>State: ${esc(doc.buyer.state)}${doc.buyer.phone ? ` · Phone: ${esc(doc.buyer.phone)}` : ""}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Goods</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Taxable</th>
          ${taxColumns}
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals">
        <table>
          <tr><td>Subtotal</td><td class="num">${formatInr(doc.subtotal)}</td></tr>
          ${
            doc.discountTotal > 0
              ? `<tr><td>Discount${doc.couponCode ? ` (${esc(doc.couponCode)})` : ""}</td><td class="num">− ${formatInr(doc.discountTotal)}</td></tr>`
              : ""
          }
          ${taxSummary}
          <tr><td>Shipping</td><td class="num">${doc.shippingTotal === 0 ? "FREE" : formatInr(doc.shippingTotal)}</td></tr>
          <tr><td>Grand Total</td><td class="num">${formatInr(doc.grandTotal)}</td></tr>
        </table>
      </div>
    </div>

    <div class="footer">
      <p><strong>Terms:</strong> This is a computer-generated GST tax invoice for your wholesale purchase on VyaparSetu. Goods once sold are subject to the seller's return policy. Tax is charged as per applicable GST law.</p>
      <div class="sign">
        <div>For ${esc(VYAPARSETU_BILLING.legalName)}</div>
        <div style="margin-top:48px;font-weight:600;">Authorised Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
