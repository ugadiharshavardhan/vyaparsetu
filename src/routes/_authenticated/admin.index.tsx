import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Box,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Pill } from "@/components/supplier/Pill";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { useAllProducts } from "@/hooks/useCatalog";
import {
  useAdminBuyers,
  useAdminSellers,
  type AdminBuyer,
  type AdminSeller,
} from "@/hooks/useAdminSellers";
import type { Product } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — VyaparSetu" }] }),
  component: AdminOverview,
});

function statusTone(status: string) {
  if (status === "verified") return "success" as const;
  if (status === "rejected") return "danger" as const;
  if (status === "under_review") return "warning" as const;
  return "info" as const;
}

function AdminOverview() {
  const { data: sellers = [], isLoading: sellersLoading, error: sellersError } = useAdminSellers();
  const { data: buyers = [], isLoading: buyersLoading, error: buyersError } = useAdminBuyers();
  const { data: products = [], isLoading: productsLoading, error: productsError } = useAllProducts();

  const loading = sellersLoading || buyersLoading || productsLoading;
  const verified = sellers.filter((s) => s.verification_status === "verified").length;
  const pendingVer = sellers.filter(
    (s) => s.verification_status === "pending" || s.verification_status === "under_review",
  ).length;
  const inStock = products.filter((p) => p.inStock).length;

  const sellerColumns: AdminColumn<AdminSeller>[] = [
    {
      key: "business",
      header: "Seller",
      render: (s) => (
        <div className="min-w-0">
          <div className="truncate font-semibold">{s.business_name || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {s.owner_name || s.full_name || s.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (s) => (
        <div className="min-w-0 text-sm">
          <div className="truncate">{s.email || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">{s.phone || "—"}</div>
        </div>
      ),
    },
    {
      key: "gst",
      header: "GSTIN",
      render: (s) => <span className="font-mono text-xs">{s.gst_number || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Pill tone={statusTone(s.verification_status)}>
          {s.verification_status === "under_review" ? "under review" : s.verification_status}
        </Pill>
      ),
    },
  ];

  const buyerColumns: AdminColumn<AdminBuyer>[] = [
    {
      key: "name",
      header: "Buyer",
      render: (b) => (
        <div className="min-w-0">
          <div className="truncate font-semibold">{b.full_name || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">{b.business_name || "—"}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (b) => (
        <div className="min-w-0 text-sm">
          <div className="truncate">{b.email || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">{b.phone || "—"}</div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (b) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">{b.address || "—"}</span>
      ),
    },
  ];

  const productColumns: AdminColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          {p.image ? (
            <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
              <Box className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold">{p.name}</div>
            <div className="truncate text-xs text-muted-foreground">{p.brand || p.sku || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p) => <span className="text-sm text-muted-foreground">{p.category || "—"}</span>,
    },
    {
      key: "price",
      header: "Wholesale",
      render: (p) => <span className="text-sm font-medium">{inr(p.wholesalePrice)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <Pill tone={p.inStock ? "success" : "danger"}>{p.inStock ? `${p.stockCount}` : "Out"}</Pill>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Admin dashboard"
        description="Live sellers, buyers and catalog products from the database."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/verifications">Seller verifications</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/users">All users</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/products">Products</Link>
            </Button>
          </div>
        }
      />

      {(sellersError || buyersError || productsError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {sellersError instanceof Error
            ? sellersError.message
            : buyersError instanceof Error
              ? buyersError.message
              : productsError instanceof Error
                ? productsError.message
                : "Failed to load admin data"}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sellers" value={String(sellers.length)} hint="All seller accounts" icon={Building2} tone="brand" />
        <StatCard label="Buyers" value={String(buyers.length)} hint="Retailer accounts" icon={ShoppingBag} tone="info" delay={0.05} />
        <StatCard label="Products" value={String(products.length)} hint={`${inStock} in stock`} icon={Boxes} tone="brand" delay={0.1} />
        <StatCard label="Verified sellers" value={String(verified)} hint={`${pendingVer} awaiting review`} icon={CheckCircle2} tone="success" delay={0.15} />
        <StatCard label="Pending review" value={String(pendingVer)} hint="Open verifications" icon={Clock} tone="warning" delay={0.2} />
        <StatCard label="Total accounts" value={String(sellers.length + buyers.length)} hint="Buyers + sellers" icon={Users} tone="info" delay={0.25} />
        <StatCard label="Catalog items" value={String(products.length)} hint="All products" icon={Package} tone="brand" delay={0.3} />
        <StatCard label="Out of stock" value={String(products.length - inStock)} hint="Need restock" icon={Box} tone="warning" delay={0.35} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading platform data…
        </div>
      ) : (
        <div className="space-y-8">
          <SectionCard
            title="Seller accounts"
            description={`${sellers.length} sellers — approve pending ones under Verifications`}
            action={
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/verifications">Review</Link>
              </Button>
            }
          >
            <AdminTable
              rows={sellers}
              columns={sellerColumns}
              getRowId={(s) => s.id}
              searchable={(s) =>
                `${s.business_name} ${s.owner_name} ${s.full_name} ${s.email} ${s.gst_number} ${s.phone}`
              }
              searchPlaceholder="Search sellers…"
            />
          </SectionCard>

          <SectionCard
            title="Buyer accounts"
            description={`${buyers.length} retailer / buyer accounts`}
            action={
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/users">View all</Link>
              </Button>
            }
          >
            <AdminTable
              rows={buyers}
              columns={buyerColumns}
              getRowId={(b) => b.id}
              searchable={(b) => `${b.full_name} ${b.business_name} ${b.email} ${b.phone} ${b.address}`}
              searchPlaceholder="Search buyers…"
            />
          </SectionCard>

          <SectionCard
            title="Catalog products"
            description={`${products.length} items across the marketplace`}
            action={
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin/products">Manage</Link>
              </Button>
            }
          >
            <AdminTable
              rows={products}
              columns={productColumns}
              getRowId={(p) => p.id}
              searchable={(p) => `${p.name} ${p.brand} ${p.sku} ${p.category} ${p.supplier?.name ?? ""}`}
              searchPlaceholder="Search products…"
            />
          </SectionCard>
        </div>
      )}
    </AdminLayout>
  );
}
