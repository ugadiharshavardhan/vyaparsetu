import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, MessageSquare, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verificationQueue, type VerificationRequest } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/verifications")({
  head: () => ({ meta: [{ title: "Verifications — Admin" }] }),
  component: VerificationsPage,
});

function VerificationsPage() {
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState(verificationQueue);

  const set = (id: string, s: VerificationRequest["status"]) =>
    setItems((all) => all.map((v) => (v.id === id ? { ...v, status: s } : v)));

  const filtered = items.filter((v) => status === "all" || v.status === status);

  const columns: AdminColumn<VerificationRequest>[] = [
    { key: "id", header: "Request", render: (v) => <span className="font-mono text-xs">{v.id}</span> },
    { key: "business", header: "Business", render: (v) => <span className="font-semibold">{v.business}</span> },
    { key: "gst", header: "GSTIN", render: (v) => <span className="font-mono text-xs">{v.gst}</span> },
    { key: "pan", header: "PAN", render: (v) => <span className="font-mono text-xs">{v.pan}</span> },
    { key: "state", header: "State", render: (v) => <span className="text-sm text-muted-foreground">{v.state}</span> },
    { key: "docs", header: "Docs", render: (v) => <span className="inline-flex items-center gap-1 text-sm"><FileText className="h-3.5 w-3.5" />{v.documents}</span> },
    {
      key: "status", header: "Status", render: (v) => (
        <Pill tone={v.status === "approved" ? "success" : v.status === "rejected" ? "danger" : v.status === "more_info" ? "warning" : "info"}>
          {v.status.replace("_", " ")}
        </Pill>
      ),
    },
    {
      key: "actions", header: "", className: "text-right", render: (v) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => { set(v.id, "approved"); toast.success("Verification approved"); }}>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { set(v.id, "more_info"); toast("Requested more info"); }}>
            <MessageSquare className="h-4 w-4 text-warning" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { set(v.id, "rejected"); toast.error("Verification rejected"); }}>
            <XCircle className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Business verification" description="Review GST, PAN and business documents submitted by suppliers." />
      <AdminTable
        rows={filtered}
        columns={columns}
        getRowId={(v) => v.id}
        searchable={(v) => `${v.business} ${v.gst} ${v.pan}`}
        searchPlaceholder="Search by business, GSTIN, PAN…"
        toolbar={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="more_info">Awaiting info</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </AdminLayout>
  );
}
