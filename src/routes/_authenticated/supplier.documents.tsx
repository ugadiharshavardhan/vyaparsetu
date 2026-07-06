import { createFileRoute } from "@tanstack/react-router";
import { FileCheck, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/supplier/Pill";

export const Route = createFileRoute("/_authenticated/supplier/documents")({
  head: () => ({ meta: [{ title: "Documents — Supplier" }] }),
  component: DocumentsPage,
});

const DOCUMENTS = [
  { name: "GST certificate", status: "verified", updated: "12 Apr 2026" },
  { name: "PAN card", status: "verified", updated: "12 Apr 2026" },
  { name: "Business address proof", status: "verified", updated: "18 May 2026" },
  { name: "FSSAI licence", status: "verified", updated: "02 Jul 2026" },
  { name: "Cancelled cheque", status: "pending", updated: "—" },
  { name: "MSME certificate", status: "pending", updated: "—" },
];

function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="container-page space-y-6 py-8">
        <PageHeader
          title="Documents"
          description="Central hub for statutory and trust-building documents."
          action={<Button onClick={() => toast.info("Upload flow coming soon")}><Upload className="mr-1.5 h-4 w-4" />Upload new</Button>}
        />

        <SectionCard title="Uploaded documents">
          <ul className="divide-y divide-border">
            {DOCUMENTS.map((d) => (
              <li key={d.name} className="flex items-center gap-4 py-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${d.status === "verified" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                  {d.status === "verified" ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">Last updated {d.updated}</div>
                </div>
                <Pill tone={d.status === "verified" ? "success" : "warning"}>{d.status}</Pill>
                <Button size="sm" variant="outline">View</Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
