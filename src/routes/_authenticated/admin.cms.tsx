import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Pencil } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cmsPages, homepageSections } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  head: () => ({ meta: [{ title: "CMS — Admin" }] }),
  component: CmsPage,
});

function CmsPage() {
  const [sections, setSections] = useState(homepageSections);
  const toggle = (id: string) => setSections((all) => all.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  return (
    <AdminLayout>
      <PageHeader title="Content management" description="Homepage layout, static pages, FAQs and blog." />

      <SectionCard title="Homepage sections" description="Toggle visibility and reorder">
        <div className="space-y-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{s.title}</span>
                <Pill tone={s.enabled ? "success" : "muted"}>{s.enabled ? "Live" : "Hidden"}</Pill>
              </div>
              <Switch checked={s.enabled} onCheckedChange={() => toggle(s.id)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Static pages" description="About, Privacy, Terms, Contact, more">
        <AdminTable
          rows={cmsPages}
          getRowId={(p) => p.id}
          searchable={(p) => `${p.title} ${p.slug}`}
          columns={[
            { key: "title", header: "Title", render: (p) => <span className="font-semibold">{p.title}</span> },
            { key: "slug", header: "Slug", render: (p) => <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span> },
            { key: "status", header: "Status", render: (p) => <Pill tone={p.status === "published" ? "success" : "warning"}>{p.status}</Pill> },
            { key: "updated", header: "Last updated", render: (p) => <span className="text-xs text-muted-foreground">{p.updated}</span> },
            {
              key: "actions", header: "", className: "text-right", render: () => (
                <Button size="sm" variant="ghost" onClick={() => toast.info("Editor coming soon")}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
              ),
            },
          ] as AdminColumn<typeof cmsPages[number]>[]}
        />
      </SectionCard>

      <SectionCard title="Blog" description="Publishing workflow — placeholder">
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Blog editor and publishing workflow ships in a future phase.
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
