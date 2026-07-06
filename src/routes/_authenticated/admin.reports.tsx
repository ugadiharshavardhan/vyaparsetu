import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const REPORTS = [
  { id: "sales", title: "Sales report", desc: "GMV, orders, refunds and taxes.", freq: "Daily" },
  { id: "revenue", title: "Revenue report", desc: "Gross, commission and net revenue.", freq: "Weekly" },
  { id: "inventory", title: "Inventory report", desc: "Stock levels across warehouses.", freq: "Daily" },
  { id: "gst", title: "GST report", desc: "CGST, SGST and IGST filings.", freq: "Monthly" },
  { id: "supplier", title: "Supplier report", desc: "Payouts, performance and ratings.", freq: "Weekly" },
  { id: "customer", title: "Customer report", desc: "Acquisition, LTV and churn.", freq: "Monthly" },
  { id: "order", title: "Order report", desc: "Status breakdown, cancellations and disputes.", freq: "Daily" },
];

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [range, setRange] = useState("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const generate = (id: string, fmt: string) => {
    toast.success(`Generating ${id} report as ${fmt.toUpperCase()}…`);
    setTimeout(() => toast.success(`${id} report ready`), 900);
  };

  return (
    <AdminLayout>
      <PageHeader title="Reports" description="Generate and export operational reports." />

      <SectionCard title="Report parameters" description="Applied to all downloads on this page">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Range</Label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={range !== "custom"} /></div>
          <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={range !== "custom"} /></div>
          <div className="flex items-end"><Button className="w-full" variant="outline" onClick={() => toast.success("Filter applied")}>Apply</Button></div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{r.freq}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => generate(r.id, "csv")}><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</Button>
              <Button size="sm" variant="outline" onClick={() => generate(r.id, "xlsx")}><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Excel</Button>
              <Button size="sm" variant="outline" onClick={() => generate(r.id, "pdf")}><FileText className="mr-1.5 h-3.5 w-3.5" /> PDF</Button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
