import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, MoreHorizontal } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminUsers, type AdminUser } from "@/data/admin";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [users, setUsers] = useState(adminUsers);
  const [confirm, setConfirm] = useState<{ id: string; action: "suspend" | "activate" | "delete" } | null>(null);

  const filtered = users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (status !== "all" && u.status !== status) return false;
    return true;
  });

  const applyAction = () => {
    if (!confirm) return;
    setUsers((all) => all
      .map((u) => u.id === confirm.id
        ? confirm.action === "delete" ? u : { ...u, status: confirm.action === "suspend" ? "suspended" as const : "active" as const }
        : u)
      .filter((u) => !(confirm.action === "delete" && u.id === confirm.id))
    );
    toast.success(`User ${confirm.action}d`);
    setConfirm(null);
  };

  const columns: AdminColumn<AdminUser>[] = [
    {
      key: "name", header: "User", render: (u) => (
        <div className="min-w-0">
          <div className="truncate font-semibold">{u.name}</div>
          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
        </div>
      ),
    },
    { key: "business", header: "Business", render: (u) => <span className="text-sm">{u.business}</span> },
    { key: "role", header: "Role", render: (u) => <Pill tone="info">{u.role}</Pill> },
    { key: "state", header: "State", render: (u) => <span className="text-sm text-muted-foreground">{u.state}</span> },
    { key: "orders", header: "Orders", render: (u) => <span className="text-sm">{u.orders}</span> },
    { key: "gmv", header: "GMV", render: (u) => <span className="text-sm font-medium">{inr(u.gmv)}</span> },
    {
      key: "status", header: "Status", render: (u) => (
        <Pill tone={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>
          {u.status}
        </Pill>
      ),
    },
    { key: "gst", header: "GST", render: (u) => <Pill tone={u.gstVerified ? "success" : "muted"}>{u.gstVerified ? "Verified" : "Unverified"}</Pill> },
    {
      key: "actions", header: "", className: "text-right", render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Profile view coming soon")}>View profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Edit user coming soon")}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Password reset email sent")}>Reset password</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Activity log opened")}>View activity</DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.status === "active" ? (
              <DropdownMenuItem onClick={() => setConfirm({ id: u.id, action: "suspend" })}>Suspend</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setConfirm({ id: u.id, action: "activate" })}>Activate</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => setConfirm({ id: u.id, action: "delete" })}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="User management"
        description="Search, filter and manage every buyer, supplier and admin account."
        action={<Button variant="outline" onClick={() => toast.success("Export queued")}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>}
      />

      <AdminTable
        rows={filtered}
        columns={columns}
        getRowId={(u) => u.id}
        searchable={(u) => `${u.name} ${u.email} ${u.business} ${u.state}`}
        searchPlaceholder="Search users, businesses, emails…"
        toolbar={
          <>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="retailer">Retailer</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.action === "delete" ? "Delete user?" : confirm?.action === "suspend" ? "Suspend user?" : "Activate user?"}
        description={confirm?.action === "delete" ? "This will permanently remove the account and all associated data." : "This will change the user's access to the platform."}
        destructive={confirm?.action === "delete" || confirm?.action === "suspend"}
        confirmLabel={confirm?.action === "delete" ? "Delete" : confirm?.action === "suspend" ? "Suspend" : "Activate"}
        onConfirm={applyAction}
      />
    </AdminLayout>
  );
}
