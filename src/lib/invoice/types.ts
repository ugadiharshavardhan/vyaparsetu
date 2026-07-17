import type { Order } from "@/types/commerce";

export type InvoiceParty = {
  name: string;
  addressLines: string[];
  gstin: string | null;
  state: string;
  phone: string | null;
};

export type InvoiceLineItem = {
  sno: number;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
};

export type InvoiceDocument = {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  placeOfSupply: string;
  isInterstate: boolean;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  items: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  couponCode: string | null;
  cgst: number;
  sgst: number;
  igst: number;
  gstTotal: number;
  shippingTotal: number;
  grandTotal: number;
  paymentMethod: string | null;
  paymentStatus: string;
};

export type InvoiceBuildInput = {
  order: Order;
  invoiceNumber: string;
  issuedAt: string;
  buyerGstin?: string | null;
  buyerBusinessName?: string | null;
};
