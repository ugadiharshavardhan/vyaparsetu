import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { auditLogs, type AuditLogEntry } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit logs — Admin" }] }),
  component: AuditPage,
});

function AuditPage() {
  const columns: AdminColumn<AuditLogEntry>[] = [
    { key: "at", header: "When", render: (l) => <span className="text-xs text-muted-foreground">{new Date(l.at).toLocaleString()}</span> },
    { key: "actor", header: "Actor", render: (l) => <span className="font-medium text-sm">{l.actor}</span> },
    { key: "role", header: "Role", render: (l) => <Pill tone="info">{l.role}</Pill> },
    { key: "action", header: "Action", render: (l) => <span className="text-sm">{l.action}</span> },
    { key: "target", header: "Target", render: (l) => <span className="font-mono text-xs">{l.target}</span> },
    { key: "ip", header: "IP", render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.ip}</span> },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Audit logs" description="Every administrative action is logged for compliance." />
      <AdminTable rows={auditLogs} columns={columns} getRowId={(l) => l.id} searchable={(l) => `${l.actor} ${l.action} ${l.target} ${l.ip}`} pageSize={15} />
    </AdminLayout>
  );
}
