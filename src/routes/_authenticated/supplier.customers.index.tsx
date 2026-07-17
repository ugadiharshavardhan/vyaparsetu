import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Search, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/supplier/DataTable";
import { Pill } from "@/components/supplier/Pill";
import { useSupplierCustomers } from "@/hooks/useSupplier";
import type { SupplierCustomer } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/customers/")({
  head: () => ({ meta: [{ title: "Buyers — Seller" }] }),
  component: BuyersPage,
});

function BuyersPage() {
  const { customers, isLoading } = useSupplierCustomers();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = customers.filter((c) => {
    if (q && !`${c.name} ${c.business} ${c.city} ${c.gstNumber} ${c.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-page space-y-8 py-8">
      <PageHeader
        title="Buyers"
        description="Manage your retailer network, monitor purchasing behaviour, and communicate directly."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Exporting buyers list")}><Download className="mr-1.5 h-4 w-4" /> Export</Button>
          </div>
        }
      />

      <SectionCard className="p-0 overflow-hidden border-border/50 shadow-soft">
        <div className="px-6 py-5 border-b border-border flex items-center bg-muted/5 rounded-t-2xl">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
            <Input className="pl-9.5 bg-background rounded-full border-border/70 h-10 shadow-sm" placeholder="Search by name, business, city or GST..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <DataTable<SupplierCustomer>
          rows={filtered}
          pageSize={10}
          embedded={true}
          columns={[
            {
              key: "business",
              header: "Buyer Business",
              cell: (c) => (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
                    {(c.business || c.name || "B").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate">{c.business || c.name}</span>
                    {c.name && c.name !== c.business && (
                      <span className="text-xs text-muted-foreground truncate">{c.name}</span>
                    )}
                  </div>
                </div>
              )
            },
            {
              key: "contact",
              header: "Contact",
              cell: (c) => (
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate max-w-[180px]">{c.email || "No email"}</span>
                </div>
              )
            },
            {
              key: "location",
              header: "Location",
              cell: (c) => (
                <div className="flex flex-col">
                  <span className="font-medium">{c.city || "—"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">{c.address || "No address provided"}</span>
                </div>
              )
            },
            {
              key: "gst",
              header: "GST Number",
              cell: (c) => <span className="font-mono text-sm">{c.gstNumber || "Unregistered"}</span>
            },
            {
              key: "orders",
              header: "Total Orders",
              cell: (c) => <span className="font-semibold">{c.orders}</span>
            },
            {
              key: "spent",
              header: "Lifetime Value",
              cell: (c) => <span className="font-semibold text-brand">{inr(c.spent)}</span>
            },
            {
              key: "last",
              header: "Last Order",
              cell: (c) => <span className="text-sm">{new Date(c.lastOrderAt).toLocaleDateString()}</span>
            },
            {
              key: "status",
              header: "Status",
              cell: (c) => <Pill tone={c.status === "inactive" ? "muted" : "success"}>{c.status === "inactive" ? "Inactive" : "Active"}</Pill>
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (c) => (
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate({ to: "/supplier/customers/$id", params: { id: c.id } }); }}>View</Button>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); toast.info("Messaging coming soon"); }}><MessageSquare className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              ),
            },
          ]}
          onRowClick={(c) => navigate({ to: "/supplier/customers/$id", params: { id: c.id } })}
          empty={
            <div className="space-y-4 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {isLoading ? "Loading buyers…" : "No buyers found"}
                </div>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  {isLoading
                    ? "Fetching the retailers who ordered your products."
                    : q
                      ? "No buyers match your search."
                      : "No one has ordered your products yet. Buyers appear here after they place an order."}
                </p>
              </div>
            </div>
          }
        />
      </SectionCard>
    </div>
  );
}
