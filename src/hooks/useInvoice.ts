import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/hooks/useProfile";
import type { Order } from "@/types/commerce";
import { generateInvoiceNumber } from "@/lib/commerce";
import { buildInvoiceDocument } from "@/lib/invoice/buildInvoiceDocument";
import { downloadInvoiceHtml } from "@/lib/invoice/downloadInvoice";
import { renderInvoiceHtml } from "@/lib/invoice/renderInvoiceHtml";
import { toast } from "sonner";

export type InvoiceRow = {
  id: string;
  order_id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  issued_at: string;
  pdf_url: string | null;
};

export function useOrderInvoice(orderId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["invoice", orderId, user?.id ?? "anon"],
    enabled: !!orderId && !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<InvoiceRow | null> => {
      if (!orderId || !user) return null;
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("order_id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as InvoiceRow | null;
    },
  });
}

async function ensureInvoiceRow(order: Order, userId: string): Promise<InvoiceRow> {
  const { data: existing, error: fetchErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", order.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (existing) return existing as InvoiceRow;

  const { data: created, error: insertErr } = await supabase
    .from("invoices")
    .insert({
      order_id: order.id,
      user_id: userId,
      invoice_number: generateInvoiceNumber(),
      amount: order.grand_total,
      gst_amount: order.gst_total,
    })
    .select("*")
    .single();
  if (insertErr) throw insertErr;
  return created as InvoiceRow;
}

export function useDownloadOrderInvoice() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      order,
      profile,
    }: {
      order: Order;
      profile?: Profile | null;
    }) => {
      if (!user) throw new Error("Please sign in");
      const invoice = await ensureInvoiceRow(order, user.id);
      const doc = buildInvoiceDocument({
        order,
        invoiceNumber: invoice.invoice_number,
        issuedAt: invoice.issued_at,
        buyerGstin: profile?.gst_number ?? order.shipping_address.gst_number,
        buyerBusinessName: profile?.business_name ?? undefined,
      });
      const html = renderInvoiceHtml(doc);
      downloadInvoiceHtml(html, invoice.invoice_number);
      return invoice;
    },
    onSuccess: (_invoice, { order }) => {
      qc.invalidateQueries({ queryKey: ["invoice", order.id] });
      toast.success("GST invoice downloaded");
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not download invoice"),
  });
}
