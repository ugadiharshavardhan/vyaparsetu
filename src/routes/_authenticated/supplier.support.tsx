import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/supplier/support")({
  head: () => ({ meta: [{ title: "Support — Supplier" }] }),
  component: SupportPage,
});

function SupportPage() {
  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Support" description="We're here 24/7 to help you grow." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={MessageCircle} title="Live chat" desc="Avg response ≤ 3 min" />
          <Card icon={Phone} title="Call us" desc="+91 22 4890 1234" />
          <Card icon={Mail} title="Email" desc="sellers@vyaparsetu.in" />
          <Card icon={BookOpen} title="Help centre" desc="Guides & tutorials" />
        </div>

        <SectionCard title="Open a ticket" description="Describe your issue and we'll get back to you shortly">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Subject"><Input placeholder="e.g. Order VS-1044 needs urgent help" /></Field>
            <Field label="Priority"><Input placeholder="Normal / Urgent" /></Field>
            <Field label="Message" span><Textarea rows={5} placeholder="Explain the issue…" /></Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => toast.success("Ticket submitted")}><LifeBuoy className="mr-1.5 h-4 w-4" />Submit ticket</Button>
          </div>
        </SectionCard>
      </div>
    
  );
}

function Card({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-4 w-4" /></span>
      <div className="mt-3 font-display font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
