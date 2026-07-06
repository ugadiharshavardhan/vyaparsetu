import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Plus, Radio, Send } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { adminBroadcasts, type AdminNotification } from "@/data/admin";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState(adminBroadcasts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "",
    audience: "all" as AdminNotification["audience"],
    channel: "in_app" as AdminNotification["channel"],
  });

  const send = () => {
    if (!form.title || !form.body) return toast.error("Title and body required");
    setItems((all) => [
      { id: `nb-${Date.now()}`, ...form, status: "sent", sentAt: new Date().toISOString(), reach: 4200 },
      ...all,
    ]);
    toast.success("Broadcast sent");
    setOpen(false);
    setForm({ title: "", body: "", audience: "all", channel: "in_app" });
  };

  const channelIcon = (c: AdminNotification["channel"]) =>
    c === "email" ? <Mail className="h-3.5 w-3.5" /> : c === "push" ? <Radio className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />;

  const columns: AdminColumn<AdminNotification>[] = [
    { key: "title", header: "Title", render: (n) => <div><div className="font-semibold">{n.title}</div><div className="text-xs text-muted-foreground line-clamp-1">{n.body}</div></div> },
    { key: "audience", header: "Audience", render: (n) => <Pill tone="info">{n.audience}</Pill> },
    { key: "channel", header: "Channel", render: (n) => <span className="inline-flex items-center gap-1 text-sm">{channelIcon(n.channel)} {n.channel.replace("_", " ")}</span> },
    { key: "status", header: "Status", render: (n) => <Pill tone={n.status === "sent" ? "success" : n.status === "scheduled" ? "info" : "warning"}>{n.status}</Pill> },
    { key: "reach", header: "Reach", render: (n) => <span className="text-sm">{n.reach.toLocaleString("en-IN")}</span> },
    { key: "sent", header: "When", render: (n) => <span className="text-xs text-muted-foreground">{n.sentAt ? new Date(n.sentAt).toLocaleString() : "—"}</span> },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Notifications"
        description="Broadcast announcements, maintenance alerts and product updates."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New broadcast</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send broadcast</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Scheduled maintenance" /></div>
                <div><Label>Message</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body of the notification" rows={4} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Audience</Label>
                    <Select value={form.audience} onValueChange={(v: AdminNotification["audience"]) => setForm({ ...form, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="buyers">Buyers only</SelectItem>
                        <SelectItem value="suppliers">Suppliers only</SelectItem>
                        <SelectItem value="admins">Admins only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <Select value={form.channel} onValueChange={(v: AdminNotification["channel"]) => setForm({ ...form, channel: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_app">In-app</SelectItem>
                        <SelectItem value="email">Email (placeholder)</SelectItem>
                        <SelectItem value="push">Push (placeholder)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={send}><Send className="mr-2 h-4 w-4" /> Send now</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <AdminTable rows={items} columns={columns} getRowId={(n) => n.id} searchable={(n) => `${n.title} ${n.body}`} />

      <SectionCard title="Email templates" description="Marketing and transactional templates">
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-6 w-6" />
          Template editor and email provider integration (SES / SendGrid) ship in a future phase.
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
