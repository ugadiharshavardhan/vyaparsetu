import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Store,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  docsCount,
  useAdminSellers,
  useUpdateSellerVerification,
  type AdminSeller,
  type VerificationStatus,
} from "@/hooks/useAdminSellers";

export const Route = createFileRoute("/_authenticated/admin/verifications")({
  head: () => ({ meta: [{ title: "Verifications — Admin" }] }),
  component: VerificationsPage,
});

function statusTone(status: VerificationStatus) {
  if (status === "verified") return "success" as const;
  if (status === "rejected") return "danger" as const;
  if (status === "under_review") return "warning" as const;
  return "info" as const;
}

function statusLabel(status: VerificationStatus) {
  if (status === "under_review") return "under review";
  return status;
}

function VerificationsPage() {
  const { data: sellers = [], isLoading, error } = useAdminSellers();
  const updateStatus = useUpdateSellerVerification();
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminSeller | null>(null);
  const [confirm, setConfirm] = useState<{
    seller: AdminSeller;
    next: VerificationStatus;
  } | null>(null);

  const filtered = useMemo(() => {
    if (status === "all") return sellers;
    if (status === "pending_queue") {
      return sellers.filter(
        (s) => s.verification_status === "pending" || s.verification_status === "under_review",
      );
    }
    return sellers.filter((s) => s.verification_status === status);
  }, [sellers, status]);

  const pendingCount = sellers.filter(
    (s) => s.verification_status === "pending" || s.verification_status === "under_review",
  ).length;

  const apply = async () => {
    if (!confirm) return;
    try {
      await updateStatus.mutateAsync({ id: confirm.seller.id, status: confirm.next });
      toast.success(
        confirm.next === "verified"
          ? `${confirm.seller.business_name || "Seller"} approved — products now visible to buyers`
          : confirm.next === "rejected"
            ? `${confirm.seller.business_name || "Seller"} rejected`
            : "Status updated",
      );
      setConfirm(null);
      setSelected((cur) =>
        cur?.id === confirm.seller.id ? { ...cur, verification_status: confirm.next } : cur,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update verification");
    }
  };

  const columns: AdminColumn<AdminSeller>[] = [
    {
      key: "business",
      header: "Business",
      render: (s) => (
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => setSelected(s)}
        >
          <div className="truncate font-semibold hover:text-brand">{s.business_name || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {s.owner_name || s.full_name || s.email || s.id.slice(0, 8)}
          </div>
        </button>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (s) => (
        <div className="min-w-0 text-sm">
          <div className="truncate">{s.email || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">{s.phone || "—"}</div>
        </div>
      ),
    },
    {
      key: "gst",
      header: "GSTIN",
      render: (s) => <span className="font-mono text-xs">{s.gst_number || "—"}</span>,
    },
    {
      key: "state",
      header: "Location",
      render: (s) => (
        <span className="text-sm text-muted-foreground">
          {[s.city, s.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "docs",
      header: "Assets",
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <FileText className="h-3.5 w-3.5" />
          {docsCount(s)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Pill tone={statusTone(s.verification_status)}>{statusLabel(s.verification_status)}</Pill>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(s)} title="View details">
            <Store className="h-4 w-4" />
          </Button>
          {s.verification_status !== "verified" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={updateStatus.isPending}
              onClick={() => setConfirm({ seller: s, next: "verified" })}
              title="Approve seller"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
            </Button>
          )}
          {s.verification_status !== "rejected" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={updateStatus.isPending}
              onClick={() => setConfirm({ seller: s, next: "rejected" })}
              title="Reject seller"
            >
              <XCircle className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Seller verification"
        description="Review seller accounts, brand assets and documents. Only verified sellers' products appear to buyers."
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load sellers"}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading sellers…
        </div>
      ) : (
        <AdminTable
          rows={filtered}
          columns={columns}
          getRowId={(s) => s.id}
          searchable={(s) =>
            `${s.business_name} ${s.owner_name} ${s.full_name} ${s.email} ${s.gst_number} ${s.phone}`
          }
          searchPlaceholder="Search by business, owner, email, GSTIN…"
          toolbar={
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{pendingCount} awaiting review</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sellers</SelectItem>
                  <SelectItem value="pending_queue">Needs review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}

      <SellerDetailDialog
        seller={selected}
        onClose={() => setSelected(null)}
        onApprove={() => selected && setConfirm({ seller: selected, next: "verified" })}
        onReject={() => selected && setConfirm({ seller: selected, next: "rejected" })}
        busy={updateStatus.isPending}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.next === "verified"
            ? "Approve seller?"
            : confirm?.next === "rejected"
              ? "Reject seller?"
              : "Update status?"
        }
        description={
          confirm?.next === "verified" ? (
            <>
              Approving <strong>{confirm.seller.business_name || "this seller"}</strong> will make
              their products visible to buyers on the marketplace.
            </>
          ) : (
            <>
              Rejecting <strong>{confirm?.seller.business_name || "this seller"}</strong> keeps their
              products hidden from buyers until they are approved later.
            </>
          )
        }
        confirmLabel={confirm?.next === "verified" ? "Approve" : "Reject"}
        destructive={confirm?.next === "rejected"}
        onConfirm={() => void apply()}
      />
    </AdminLayout>
  );
}

function AssetThumb({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
        No {label.toLowerCase()}
      </div>
    );
  }
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes("application/pdf");
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-video items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 text-sm text-brand hover:underline"
        >
          <FileText className="h-4 w-4" /> View PDF <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
          <img src={url} alt={label} className="aspect-video w-full object-cover" />
        </a>
      )}
    </div>
  );
}

function SellerDetailDialog({
  seller,
  onClose,
  onApprove,
  onReject,
  busy,
}: {
  seller: AdminSeller | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <Dialog open={!!seller} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {seller && (
          <>
            <DialogHeader>
              <DialogTitle>{seller.business_name || "Seller account"}</DialogTitle>
              <DialogDescription>
                Review brand assets and business details before approving marketplace visibility.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={statusTone(seller.verification_status)}>
                {statusLabel(seller.verification_status)}
              </Pill>
              {seller.business_type && <Pill tone="muted">{seller.business_type}</Pill>}
              {seller.business_category && <Pill tone="info">{seller.business_category}</Pill>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AssetThumb label="Business Logo" url={seller.logo_url} />
              <AssetThumb label="Shop Image" url={seller.shop_image_url} />
              <AssetThumb label="GST Certificate" url={seller.gst_certificate_url} />
              <AssetThumb label="PAN Document" url={seller.pan_document_url} />
            </div>

            <dl className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Owner</dt>
                <dd className="font-medium">{seller.owner_name || seller.full_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium break-all">{seller.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium">{seller.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">GSTIN</dt>
                <dd className="font-mono text-xs">{seller.gst_number || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">PAN</dt>
                <dd className="font-mono text-xs">{seller.pan_number || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Joined</dt>
                <dd className="font-medium">{new Date(seller.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd className="font-medium">
                  {[seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(", ") ||
                    "—"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap justify-end gap-2">
              {seller.verification_status !== "rejected" && (
                <Button variant="outline" disabled={busy} onClick={onReject}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              )}
              {seller.verification_status !== "verified" && (
                <Button disabled={busy} onClick={onApprove}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Approve seller
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
