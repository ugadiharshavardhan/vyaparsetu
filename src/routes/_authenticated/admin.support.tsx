import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, MessageCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminTickets, type AdminTicket } from "@/data/admin";
import { CheckCircle2, Clock, LifeBuoy, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/support")({
  head: () => ({ meta: [{ title: "Support — Admin" }] }),
  component: SupportPage,
});

function SupportPage() {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [tickets, setTickets] = useState(adminTickets);

  const filtered = tickets.filter((t) =>
    (status === "all" || t.status === status) &&
    (priority === "all" || t.priority === priority)
  );

  const open = tickets.filter((t) => t.status === "open").length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;
  const escalated = tickets.filter((t) => t.status === "escalated").length;

  const assign = (id: string, staff: string) => {
    setTickets((all) => all.map((t) => (t.id === id ? { ...t, assignee: staff } : t)));
    toast.success(`Assigned to ${staff}`);
  };
  const resolve = (id: string) => {
    setTickets((all) => all.map((t) => (t.id === id ? { ...t, status: "resolved" } : t)));
    toast.success("Ticket resolved");
  };

  const columns: AdminColumn<AdminTicket>[] = [
    { key: "id", header: "Ticket", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
    { key: "subject", header: "Subject", render: (t) => <span className="font-medium text-sm">{t.subject}</span> },
    { key: "user", header: "User", render: (t) => <span className="text-sm">{t.user}</span> },
    { key: "channel", header: "Channel", render: (t) => <Pill tone="info">{t.channel}</Pill> },
    { key: "priority", header: "Priority", render: (t) => (
      <Pill tone={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warning" : t.priority === "medium" ? "info" : "muted"}>
        {t.priority}
      </Pill>
    ) },
    { key: "status", header: "Status", render: (t) => (
      <Pill tone={t.status === "resolved" ? "success" : t.status === "escalated" ? "danger" : t.status === "pending" ? "warning" : "info"}>
        {t.status}
      </Pill>
    ) },
    { key: "assignee", header: "Assignee", render: (t) => t.assignee ? <span className="text-sm">{t.assignee}</span> : <span className="text-xs text-muted-foreground">Unassigned</span> },
    {
      key: "actions", header: "", className: "text-right", render: (t) => (
        <div className="flex justify-end gap-1">
          <Select onValueChange={(v) => assign(t.id, v)}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Assign" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Aditi (Support)">Aditi (Support)</SelectItem>
              <SelectItem value="Rohan (Ops)">Rohan (Ops)</SelectItem>
              <SelectItem value="Neha (Finance)">Neha (Finance)</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={() => resolve(t.id)}>Resolve</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Support center" description="Handle tickets, escalations and buyer/supplier assistance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tickets" value={String(open)} hint="Needs response" icon={LifeBuoy} tone="brand" />
        <StatCard label="Pending" value={String(pending)} hint="Awaiting user" icon={Clock} tone="warning" delay={0.05} />
        <StatCard label="Escalated" value={String(escalated)} hint="Urgent" icon={Zap} tone="warning" delay={0.1} />
        <StatCard label="Resolved" value={String(resolved)} hint="This month" icon={CheckCircle2} tone="success" delay={0.15} />
      </div>

      <AdminTable
        rows={filtered}
        columns={columns}
        getRowId={(t) => t.id}
        searchable={(t) => `${t.id} ${t.subject} ${t.user}`}
        searchPlaceholder="Search tickets…"
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <SectionCard title="Live chat" description="Real-time chat integration">
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <MessageCircle className="mx-auto mb-2 h-6 w-6" />
          Live chat (Freshchat / Intercom) will be wired up in a future phase.
        </div>
      </SectionCard>

      <SectionCard title="Internal notes" description="Escalation runbook">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="rounded-lg border border-border p-3"><AlertCircle className="mr-2 inline h-4 w-4" /> Urgent tickets must be responded to within 30 minutes.</p>
          <p className="rounded-lg border border-border p-3"><AlertCircle className="mr-2 inline h-4 w-4" /> Refund escalations go to Finance Admin.</p>
          <p className="rounded-lg border border-border p-3"><AlertCircle className="mr-2 inline h-4 w-4" /> Verification queries go to Operations Admin.</p>
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
