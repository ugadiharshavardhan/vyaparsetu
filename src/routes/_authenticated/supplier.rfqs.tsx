import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText, MessageSquare, CheckCircle2, Clock, Search, MoreVertical, XCircle, FileQuestion, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupplierRfqs } from "@/hooks/useSupplier";
import type { SupplierRFQ } from "@/types/supplier";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/supplier/rfqs")({
  head: () => ({ meta: [{ title: "Quotations — Seller" }] }),
  component: RfqsPage,
});

const STATUS_TONE: Record<SupplierRFQ["status"], "warning" | "info" | "success" | "danger" | "muted"> = {
  new: "info",
  pending_response: "warning",
  quoted: "success",
  accepted: "success",
  rejected: "danger",
  expired: "muted",
};

const STATUS_LABEL: Record<SupplierRFQ["status"], string> = {
  new: "New",
  pending_response: "Pending Response",
  quoted: "Quoted",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

function RfqsPage() {
  const { rfqs, updateStatus } = useSupplierRfqs();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = {
    new: rfqs.filter((r) => r.status === "new" || r.status === "pending_response").length,
    quoted: rfqs.filter((r) => r.status === "quoted").length,
    accepted: rfqs.filter((r) => r.status === "accepted").length,
    expired: rfqs.filter((r) => r.status === "expired" || r.status === "rejected").length,
  };

  const filtered = rfqs.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (q && !`${r.rfqNumber} ${r.retailerName} ${r.products}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Quotations (RFQs)"
        description="Respond to bulk purchase requests and negotiate with retailers."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="New Requests" value={counts.new} icon={AlertCircle} tint="bg-warning/20 text-warning" />
        <SummaryCard title="Pending Retailer" value={counts.quoted} icon={Clock} tint="bg-brand/10 text-brand" />
        <SummaryCard title="Accepted" value={counts.accepted} icon={CheckCircle2} tint="bg-success/20 text-success" />
        <SummaryCard title="Expired/Rejected" value={counts.expired} icon={XCircle} tint="bg-muted text-muted-foreground" />
      </div>

      <SectionCard className="p-0 overflow-visible">
        <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center bg-muted/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 bg-background" placeholder="Search RFQ ID, Retailer, Product..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="pending_response">Pending Response</SelectItem>
                <SelectItem value="quoted">Quoted (Awaiting Buyer)</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable<SupplierRFQ>
          rows={filtered}
          pageSize={10}
          columns={[
            { 
              key: "id", 
              header: "RFQ ID", 
              cell: (r) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{r.rfqNumber}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ) 
            },
            { 
              key: "retailer", 
              header: "Retailer", 
              cell: (r) => <span className="font-medium">{r.retailerName}</span>
            },
            { 
              key: "product", 
              header: "Requested Product", 
              cell: (r) => (
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{r.products}</span>
                  <span className="text-xs text-muted-foreground">Qty requested: {r.qty}</span>
                </div>
              ) 
            },
            { 
              key: "price", 
              header: "Target Price", 
              cell: (r) => <span className="font-semibold">{inr(r.targetPrice)}</span> 
            },
            { 
              key: "status", 
              header: "Status", 
              cell: (r) => <Pill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Pill> 
            },
            {
              key: "expiry",
              header: "Expiry Date",
              cell: (r) => <span className="text-sm font-medium">{new Date(r.expiryDate).toLocaleDateString()}</span>
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) => (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/rfqs/$id", params: { id: r.id } }); }}>
                    {r.status === "new" || r.status === "pending_response" ? "Respond" : "View"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(r.status === "new" || r.status === "pending_response") && (
                        <>
                          <DropdownMenuItem onClick={() => navigate({ to: "/supplier/rfqs/$id", params: { id: r.id } })}><MessageSquare className="mr-2 h-3.5 w-3.5" /> Send Quote</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { updateStatus(r.id, "rejected"); toast.success("RFQ Rejected"); }}><XCircle className="mr-2 h-3.5 w-3.5" /> Reject</DropdownMenuItem>
                        </>
                      )}
                      {(r.status === "quoted" || r.status === "accepted" || r.status === "rejected" || r.status === "expired") && (
                         <DropdownMenuItem onClick={() => navigate({ to: "/supplier/rfqs/$id", params: { id: r.id } })}><FileText className="mr-2 h-3.5 w-3.5" /> View Details</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
          onRowClick={(r) => navigate({ to: "/supplier/rfqs/$id", params: { id: r.id } })}
          empty={
            <div className="space-y-4 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <FileQuestion className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">No quotations found</div>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">You don't have any RFQs matching your criteria.</p>
              </div>
            </div>
          }
        />
      </SectionCard>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, tint }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("grid h-7 w-7 place-items-center rounded-lg", tint)}><Icon className="h-3.5 w-3.5" /></span>
        <span className="text-xs font-medium text-muted-foreground line-clamp-1">{title}</span>
      </div>
      <div className="text-xl font-display font-bold">{value}</div>
    </div>
  );
}
