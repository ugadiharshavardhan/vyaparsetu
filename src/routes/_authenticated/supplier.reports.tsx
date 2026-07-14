import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, FileSpreadsheet, FileIcon, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/supplier/reports")({
  head: () => ({ meta: [{ title: "Reports — Supplier" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const reports = [
    {
      title: "Sales Report",
      description: "Detailed breakdown of sales by product, category, and date.",
      icon: <FileText className="h-6 w-6 text-brand" />,
    },
    {
      title: "Inventory Report",
      description: "Current stock levels, reorder alerts, and damaged inventory logs.",
      icon: <FileSpreadsheet className="h-6 w-6 text-info" />,
    },
    {
      title: "GST Report",
      description: "Comprehensive tax collection report for GST filing.",
      icon: <FileIcon className="h-6 w-6 text-warning" />,
    },
    {
      title: "Revenue Report",
      description: "Total gross revenue, fees deducted, and net settlements.",
      icon: <FileText className="h-6 w-6 text-success" />,
    },
    {
      title: "Orders Report",
      description: "Complete list of orders with their fulfillment and logistics status.",
      icon: <FileSpreadsheet className="h-6 w-6 text-brand" />,
    },
  ];

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader 
        title="Business Reports" 
        description="Generate and download comprehensive reports for accounting and analysis."
        action={
          <Button variant="outline" onClick={() => toast.info("Report scheduling coming soon")}>
            <Settings2 className="mr-1.5 h-4 w-4" /> Schedule Reports
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, idx) => (
          <SectionCard key={idx} className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-muted/30 rounded-xl border border-border shrink-0">
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-base">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => toast.success(`${report.title} (PDF) downloaded`)}>
                PDF
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => toast.success(`${report.title} (CSV) downloaded`)}>
                CSV
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => toast.success(`${report.title} (Excel) downloaded`)}>
                Excel
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
