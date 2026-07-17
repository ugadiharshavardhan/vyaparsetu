import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FlaskConical,
  Mail,
  MapPin,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { useProfile } from "@/hooks/useProfile";
import { useSellerSampleRequests, useSendSampleRequest } from "@/hooks/useSampleRequests";
import type { SupplierOrder } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/samples")({
  head: () => ({ meta: [{ title: "Samples — Seller" }] }),
  component: SellerSamplesPage,
});

const STATUS_LABEL: Record<SupplierOrder["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  packing: "Packing",
  ready: "Ready",
  picked_up: "Picked up",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

function statusTone(status: SupplierOrder["status"]) {
  switch (status) {
    case "delivered":
      return "success" as const;
    case "cancelled":
    case "returned":
      return "danger" as const;
    case "pending":
      return "warning" as const;
    default:
      return "info" as const;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SellerSamplesPage() {
  const { orders, updateStatus, isLoading } = useSupplierOrders();
  const { data: profile } = useProfile();
  const { byOrderItem: requestByItem } = useSellerSampleRequests();
  const sendRequest = useSendSampleRequest();
  const [search, setSearch] = useState("");

  const sampleLines = useMemo(() => {
    const lines = orders.filter((o) => o.isSample);
    const q = search.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        (o.buyerBusiness ?? o.customer).toLowerCase().includes(q),
    );
  }, [orders, search]);

  const pendingCount = sampleLines.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned",
  ).length;

  const markDelivered = async (line: SupplierOrder) => {
    try {
      await updateStatus(line.id, "delivered");
      toast.success("Sample marked as delivered — now send the approval request");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the sample order");
    }
  };

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader
        title="Samples"
        description="Paid ₹100 sample orders from buyers. Step 1: mark the sample delivered. Step 2: send the approval request — once the buyer approves, they place the bulk order."
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, product, buyer…"
              className="h-9 w-64 rounded-full pl-9"
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : sampleLines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-base font-semibold text-foreground">No sample orders yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            When buyers order paid samples of your products from the Sample Store, they will appear
            here with the buyer&apos;s details.
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {sampleLines.length} sample {sampleLines.length === 1 ? "order" : "orders"} ·{" "}
            {pendingCount} in progress
          </div>

          <div className="space-y-4">
            {sampleLines.map((line) => {
              const request = requestByItem.get(line.id);
              const buyerLabel = line.buyerBusiness || line.buyerName || line.customer;
              // Step 1: mark the sample delivered. Step 2: send the approval request.
              const canSend =
                !request &&
                line.status === "delivered" &&
                !!line.orderId &&
                !!line.buyerId;
              return (
                <div
                  key={line.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {line.product}
                          </span>
                          <Pill tone="warning">SAMPLE</Pill>
                          <Pill tone={statusTone(line.status)}>{STATUS_LABEL[line.status]}</Pill>
                          <Pill tone={line.paymentStatus === "paid" ? "success" : "muted"}>
                            {line.paymentStatus === "paid" ? "Payment received" : "Payment pending"}
                          </Pill>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Order{" "}
                          <Link
                            to="/supplier/orders/$id"
                            params={{ id: line.id }}
                            className="font-medium text-brand hover:underline"
                          >
                            {line.orderNumber}
                          </Link>{" "}
                          · {formatDate(line.createdAt)} · Sample charge {inr(line.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!request &&
                        line.status !== "delivered" &&
                        line.status !== "cancelled" &&
                        line.status !== "returned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => void markDelivered(line)}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Mark sample delivered
                          </Button>
                        )}
                      {canSend && (
                        <Button
                          size="sm"
                          className="rounded-full bg-brand text-white hover:bg-brand/90"
                          disabled={sendRequest.isPending}
                          onClick={() =>
                            sendRequest.mutate({
                              orderId: line.orderId!,
                              orderItemId: line.id,
                              buyerId: line.buyerId!,
                              orderNumber: line.orderNumber,
                              productName: line.product,
                              sellerName: profile?.business_name ?? undefined,
                              message:
                                "Your paid sample has been sent. Please check it and approve the request to go ahead with your bulk order.",
                            })
                          }
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Send approval request
                        </Button>
                      )}
                      {request?.status === "sent" && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800">
                          Awaiting buyer approval
                        </span>
                      )}
                      {request?.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved by buyer
                        </span>
                      )}
                      {request?.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-800">
                          <XCircle className="h-3.5 w-3.5" />
                          Declined by buyer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buyer details */}
                  <div className="mt-4 grid gap-3 rounded-xl border border-border/60 bg-secondary/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Buyer
                      </div>
                      <div className="mt-0.5 text-sm font-medium text-foreground">
                        {buyerLabel}
                      </div>
                      {line.buyerName && line.buyerBusiness && line.buyerName !== line.buyerBusiness && (
                        <div className="text-xs text-muted-foreground">{line.buyerName}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Email
                      </div>
                      {line.buyerEmail ? (
                        <a
                          href={`mailto:${line.buyerEmail}`}
                          className="mt-0.5 inline-flex items-center gap-1.5 truncate text-sm font-medium text-brand hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{line.buyerEmail}</span>
                        </a>
                      ) : (
                        <div className="mt-0.5 text-sm text-muted-foreground">Not available</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Deliver to
                      </div>
                      <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {line.destination}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
