import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAdminBuyers,
  useAdminSellers,
  type AdminBuyer,
  type AdminSeller,
} from "@/hooks/useAdminSellers";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsersPage,
});

type UnifiedUser = {
  id: string;
  role: "buyer" | "seller";
  name: string;
  email: string;
  business: string;
  phone: string;
  status: string;
  detail: string;
};

function mapSeller(s: AdminSeller): UnifiedUser {
  return {
    id: `seller-${s.id}`,
    role: "seller",
    name: s.owner_name || s.full_name || "—",
    email: s.email || "—",
    business: s.business_name || "—",
    phone: s.phone || "—",
    status: s.verification_status,
    detail: s.gst_number || s.state || "—",
  };
}

function mapBuyer(b: AdminBuyer): UnifiedUser {
  return {
    id: `buyer-${b.id}`,
    role: "buyer",
    name: b.full_name || "—",
    email: b.email || "—",
    business: b.business_name || "—",
    phone: b.phone || "—",
    status: "active",
    detail: b.address || "—",
  };
}

function AdminUsersPage() {
  const { data: sellers = [], isLoading: sellersLoading, error: sellersError } = useAdminSellers();
  const { data: buyers = [], isLoading: buyersLoading, error: buyersError } = useAdminBuyers();
  const [role, setRole] = useState("all");

  const users = useMemo(() => {
    const all = [...sellers.map(mapSeller), ...buyers.map(mapBuyer)];
    if (role === "all") return all;
    return all.filter((u) => u.role === role);
  }, [sellers, buyers, role]);

  const columns: AdminColumn<UnifiedUser>[] = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div className="min-w-0">
          <div className="truncate font-semibold">{u.name}</div>
          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
        </div>
      ),
    },
    { key: "business", header: "Business", render: (u) => <span className="text-sm">{u.business}</span> },
    {
      key: "role",
      header: "Role",
      render: (u) => <Pill tone={u.role === "seller" ? "info" : "muted"}>{u.role}</Pill>,
    },
    { key: "phone", header: "Phone", render: (u) => <span className="text-sm text-muted-foreground">{u.phone}</span> },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Pill
          tone={
            u.status === "verified" || u.status === "active"
              ? "success"
              : u.status === "rejected"
                ? "danger"
                : "warning"
          }
        >
          {u.status === "under_review" ? "under review" : u.status}
        </Pill>
      ),
    },
    {
      key: "detail",
      header: "Details",
      render: (u) => <span className="line-clamp-2 text-xs text-muted-foreground">{u.detail}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) =>
        u.role === "seller" ? (
          <Button size="sm" variant="outline" asChild>
            <Link to="/admin/verifications">Verify</Link>
          </Button>
        ) : null,
    },
  ];

  const loading = sellersLoading || buyersLoading;
  const error = sellersError || buyersError;

  return (
    <AdminLayout>
      <PageHeader
        title="User management"
        description="Live buyers and sellers from the database."
        action={
          <Button variant="outline" asChild>
            <Link to="/admin/verifications">Seller verifications</Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load users"}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading users…
        </div>
      ) : (
        <AdminTable
          rows={users}
          columns={columns}
          getRowId={(u) => u.id}
          searchable={(u) => `${u.name} ${u.email} ${u.business} ${u.phone} ${u.detail}`}
          searchPlaceholder="Search by name, email, business…"
          toolbar={
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="seller">Sellers</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}
    </AdminLayout>
  );
}
