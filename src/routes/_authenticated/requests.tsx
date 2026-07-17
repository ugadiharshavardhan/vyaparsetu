import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FlaskConical, Inbox, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBuyerSampleRequests,
  useRespondSampleRequest,
  type SampleRequest,
} from "@/hooks/useSampleRequests";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Requests — VyaparSetu" }] }),
  component: RequestsPage,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function RequestCard({
  request,
  onRespond,
  responding,
}: {
  request: SampleRequest;
  onRespond?: (approve: boolean) => void;
  responding?: boolean;
}) {
  const pending = request.status === "sent";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              Sample confirmation for {request.product_name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Order {request.order_number}
              {request.seller_name ? <> · From {request.seller_name}</> : null}
              {request.created_at ? <> · {formatDate(request.created_at)}</> : null}
            </div>
            {request.message && (
              <p className="mt-2 text-sm text-muted-foreground">{request.message}</p>
            )}
          </div>
        </div>

        {!pending && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              request.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {request.status === "approved" ? "Approved — order finalized" : "Declined"}
          </span>
        )}
      </div>

      {pending && onRespond && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={responding}
            onClick={() => onRespond(false)}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Decline
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-brand text-white hover:bg-brand/90"
            disabled={responding}
            onClick={() => onRespond(true)}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Approve &amp; confirm order
          </Button>
        </div>
      )}
    </div>
  );
}

function RequestsPage() {
  const { data: requests = [], isLoading } = useBuyerSampleRequests();
  const respond = useRespondSampleRequest();

  const pending = requests.filter((r) => r.status === "sent");
  const answered = requests.filter((r) => r.status !== "sent");

  return (
    <div className="container-page space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sellers send your item samples 1–2 days before the final delivery. Once you have
          checked a sample, approve its request here to confirm the order — or decline it.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-base font-semibold text-foreground">No requests yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            When you order items with &quot;Send me a sample&quot; turned on, the seller&apos;s
            confirmation requests will appear here after your sample is sent.
          </p>
          <Button asChild className="mt-5 rounded-full bg-brand text-white hover:bg-brand/90">
            <Link to="/orders">View my orders</Link>
          </Button>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Waiting for your approval ({pending.length})
              </h2>
              {pending.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  responding={respond.isPending}
                  onRespond={(approve) => respond.mutate({ request: r, approve })}
                />
              ))}
            </section>
          )}

          {answered.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Responded
              </h2>
              {answered.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
