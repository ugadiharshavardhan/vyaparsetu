import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Fingerprint, ShieldCheck, ShieldOff } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { adminSessions, failedLogins } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/security")({
  head: () => ({ meta: [{ title: "Security — Admin" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <AdminLayout>
      <PageHeader title="Security" description="Sessions, failed logins, password policy and 2FA." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active admin sessions" value={String(adminSessions.length)} hint="Live" icon={ShieldCheck} tone="success" />
        <StatCard label="Failed logins (24h)" value={String(failedLogins.length)} hint="Suspicious" icon={AlertTriangle} tone="warning" delay={0.05} />
        <StatCard label="2FA adoption" value="72%" hint="Admin users" icon={Fingerprint} tone="brand" delay={0.1} />
        <StatCard label="Blocked IPs" value="14" hint="Auto-mitigated" icon={ShieldOff} tone="info" delay={0.15} />
      </div>

      <SectionCard title="Active sessions" description="Revoke any suspicious session immediately">
        <AdminTable
          rows={adminSessions}
          getRowId={(s) => s.id}
          searchable={(s) => `${s.user} ${s.device} ${s.ip}`}
          columns={[
            { key: "user", header: "User", render: (s) => <span className="font-medium text-sm">{s.user}</span> },
            { key: "device", header: "Device", render: (s) => <span className="text-sm text-muted-foreground">{s.device}</span> },
            { key: "ip", header: "IP", render: (s) => <span className="font-mono text-xs">{s.ip}</span> },
            { key: "started", header: "Started", render: (s) => <span className="text-xs text-muted-foreground">{new Date(s.started).toLocaleString()}</span> },
            { key: "current", header: "", render: (s) => s.current ? <Pill tone="success">This session</Pill> : null },
            {
              key: "actions", header: "", className: "text-right", render: (s) => (
                <Button size="sm" variant="ghost" disabled={s.current} onClick={() => toast.success("Session revoked")}>Revoke</Button>
              ),
            },
          ] as AdminColumn<typeof adminSessions[number]>[]}
        />
      </SectionCard>

      <SectionCard title="Failed login attempts" description="Investigate potential brute-force attacks">
        <AdminTable
          rows={failedLogins}
          getRowId={(f) => f.id}
          searchable={(f) => `${f.email} ${f.ip} ${f.location}`}
          columns={[
            { key: "email", header: "Email", render: (f) => <span className="font-medium text-sm">{f.email}</span> },
            { key: "attempts", header: "Attempts", render: (f) => <Pill tone={f.attempts > 5 ? "danger" : "warning"}>{f.attempts}</Pill> },
            { key: "ip", header: "IP", render: (f) => <span className="font-mono text-xs">{f.ip}</span> },
            { key: "location", header: "Location", render: (f) => <span className="text-sm text-muted-foreground">{f.location}</span> },
            { key: "at", header: "When", render: (f) => <span className="text-xs text-muted-foreground">{new Date(f.at).toLocaleString()}</span> },
          ] as AdminColumn<typeof failedLogins[number]>[]}
        />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Password policy" description="Placeholder — enforced at auth layer">
          <PolicyRow label="Minimum 12 characters" defaultChecked />
          <PolicyRow label="Require uppercase" defaultChecked />
          <PolicyRow label="Require numeric" defaultChecked />
          <PolicyRow label="Require special character" />
          <PolicyRow label="Rotate every 90 days" />
        </SectionCard>

        <SectionCard title="Two-factor authentication" description="Placeholder — configure at auth layer">
          <PolicyRow label="Enforce 2FA for admins" defaultChecked />
          <PolicyRow label="Enforce 2FA for finance" defaultChecked />
          <PolicyRow label="Enforce 2FA for all users" />
          <PolicyRow label="Allow SMS as fallback" />
        </SectionCard>
      </div>
    </AdminLayout>
  );
}

function PolicyRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
