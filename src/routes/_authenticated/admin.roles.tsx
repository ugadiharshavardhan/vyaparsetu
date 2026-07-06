import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, Minus, ShieldCheck, Users, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { adminRoles, permissionsMatrix } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({ meta: [{ title: "Roles — Admin" }] }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <AdminLayout>
      <PageHeader title="Roles & permissions" description="Configure fine-grained access for platform administrators." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminRoles.map((r) => (
          <div key={r.key} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><ShieldCheck className="h-4 w-4" /></span>
              <div>
                <h3 className="font-display text-lg font-semibold">{r.label}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {r.members} members</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Permission matrix" description="Read-only in this phase — RBAC editor ships later">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Area</th>
                {adminRoles.map((r) => (
                  <th key={r.key} className="px-3 py-3 text-center font-semibold">{r.label.replace(" Admin", "")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row) => (
                <tr key={row.area} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium">{row.area}</td>
                  {adminRoles.map((r) => {
                    const perm = row[r.key as keyof typeof row];
                    return (
                      <td key={r.key} className="px-3 py-3 text-center">
                        {perm === true ? <Check className="mx-auto h-4 w-4 text-success" />
                          : perm === false ? <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                          : perm === "read" ? <Eye className="mx-auto h-4 w-4 text-info" />
                          : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Full access</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-info" /> Read only</span>
          <span className="flex items-center gap-1"><X className="h-3.5 w-3.5" /> No access</span>
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
