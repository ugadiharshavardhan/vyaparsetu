import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Sample confirmation flow.
 *
 * The sample ships 1-2 days ahead of the final delivery. Once the buyer has
 * received it, the seller sends a confirmation request for that order line
 * (seller order detail → "Send approval request"). The buyer sees it in the
 * "Requests" section and either approves — which finalizes/confirms the
 * order — or declines. Everything is persisted in `public.sample_requests`.
 */

export type SampleRequestStatus = "sent" | "approved" | "rejected";

export type SampleRequest = {
  id: string;
  order_id: string;
  order_item_id: string;
  seller_id: string;
  buyer_id: string;
  order_number: string;
  product_name: string;
  seller_name: string;
  message: string | null;
  status: SampleRequestStatus;
  created_at: string;
  responded_at: string | null;
};

const SAMPLE_REQUESTS_KEY = ["sample-requests"] as const;

function normalizeRow(row: Record<string, unknown>): SampleRequest {
  const status = String(row.status ?? "sent");
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    order_item_id: String(row.order_item_id),
    seller_id: String(row.seller_id),
    buyer_id: String(row.buyer_id),
    order_number: String(row.order_number ?? ""),
    product_name: String(row.product_name ?? ""),
    seller_name: String(row.seller_name ?? ""),
    message: row.message != null ? String(row.message) : null,
    status: (["sent", "approved", "rejected"].includes(status) ? status : "sent") as SampleRequestStatus,
    created_at: String(row.created_at ?? ""),
    responded_at: row.responded_at != null ? String(row.responded_at) : null,
  };
}

/** Requests sent TO the signed-in buyer (newest first). */
export function useBuyerSampleRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SAMPLE_REQUESTS_KEY, "buyer", user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async (): Promise<SampleRequest[]> => {
      const { data, error } = await supabase
        .from("sample_requests")
        .select("*")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => normalizeRow(r as unknown as Record<string, unknown>));
    },
  });
}

/** Count of unanswered requests — powers the "Requests" nav badge. */
export function usePendingSampleRequestCount() {
  const { data = [] } = useBuyerSampleRequests();
  return data.filter((r) => r.status === "sent").length;
}

/** Requests sent BY the signed-in seller, keyed by order_item_id. */
export function useSellerSampleRequests() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...SAMPLE_REQUESTS_KEY, "seller", user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async (): Promise<SampleRequest[]> => {
      const { data, error } = await supabase
        .from("sample_requests")
        .select("*")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => normalizeRow(r as unknown as Record<string, unknown>));
    },
  });
  const byOrderItem = new Map<string, SampleRequest>();
  for (const r of query.data ?? []) byOrderItem.set(r.order_item_id, r);
  return { ...query, byOrderItem };
}

export type SendSampleRequestInput = {
  orderId: string;
  orderItemId: string;
  buyerId: string;
  orderNumber: string;
  productName: string;
  sellerName?: string;
  message?: string;
};

/** Seller: ask the buyer to confirm the order after checking the sample. */
export function useSendSampleRequest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: SendSampleRequestInput) => {
      if (!user) throw new Error("Please sign in");
      const { error } = await supabase.from("sample_requests").insert({
        order_id: input.orderId,
        order_item_id: input.orderItemId,
        seller_id: user.id,
        buyer_id: input.buyerId,
        order_number: input.orderNumber,
        product_name: input.productName,
        seller_name: input.sellerName ?? "",
        message:
          input.message ??
          "Your sample has been sent ahead of the final delivery. Please check it and approve to confirm your order.",
      });
      if (error) {
        if (error.code === "23505") {
          throw new Error("You already sent a confirmation request for this item");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAMPLE_REQUESTS_KEY });
      toast.success("Request sent to the buyer — they can approve it under Requests");
    },
    onError: (e: Error) => toast.error(e.message || "Could not send the request"),
  });
}

/** Buyer: approve (finalize the order) or decline a sample request. */
export function useRespondSampleRequest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ request, approve }: { request: SampleRequest; approve: boolean }) => {
      if (!user) throw new Error("Please sign in");

      const { error } = await supabase
        .from("sample_requests")
        .update({
          status: approve ? "approved" : "rejected",
          responded_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("buyer_id", user.id);
      if (error) throw error;

      // Record the decision on the parent order. Approval finalizes/confirms
      // the order; a decline is noted so the seller sees it on the timeline.
      const { data: current } = await supabase
        .from("orders")
        .select("status_history")
        .eq("id", request.order_id)
        .eq("user_id", user.id)
        .maybeSingle();
      const hist = (
        (current?.status_history as unknown as Array<Record<string, unknown>>) ?? []
      ).concat([
        approve
          ? {
              status: "confirmed",
              at: new Date().toISOString(),
              note: `Sample approved by buyer for ${request.product_name} — order finalized`,
            }
          : {
              status: "pending",
              at: new Date().toISOString(),
              note: `Sample declined by buyer for ${request.product_name}`,
            },
      ]);
      const patch: Record<string, unknown> = { status_history: hist };
      if (approve) patch.status = "confirmed";
      await supabase
        .from("orders")
        .update(patch as never)
        .eq("id", request.order_id)
        .eq("user_id", user.id);

      return { approve };
    },
    onSuccess: ({ approve }) => {
      qc.invalidateQueries({ queryKey: SAMPLE_REQUESTS_KEY });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
      qc.invalidateQueries({ queryKey: ["seller-orders"] });
      toast.success(
        approve
          ? "Order approved — the seller has been notified and your order is confirmed"
          : "Request declined — the seller has been notified",
      );
    },
    onError: (e: Error) => toast.error(e.message || "Could not update the request"),
  });
}
