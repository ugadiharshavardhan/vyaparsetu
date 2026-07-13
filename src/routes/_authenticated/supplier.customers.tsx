import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/supplier/DataTable";
import { useSupplierCustomers } from "@/hooks/useSupplier";
import type { SupplierCustomer } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/customers")({
  head: () => ({ meta: [{ title: "Customers — Supplier" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers } = useSupplierCustomers();
  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Customers" description="Nurture repeat buyers and monitor spending patterns." />
        <DataTable<SupplierCustomer>
          rows={customers}
          columns={[
            { key: "cust", header: "Buyer", cell: (c) => <div><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">{c.business} • {c.city}</div></div> },
            { key: "orders", header: "Orders", cell: (c) => <span className="font-semibold">{c.orders}</span> },
            { key: "spent", header: "Total spent", cell: (c) => <span className="font-semibold text-brand">{inr(c.spent)}</span> },
            { key: "last", header: "Last order", cell: (c) => new Date(c.lastOrderAt).toLocaleDateString() },
            { key: "fav", header: "Favorite product", cell: (c) => c.favoriteProduct },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: () => (
                <div className="flex justify-end gap-1.5">
                  <Button size="icon" variant="outline" onClick={() => toast.info("Messaging coming soon")}><MessageSquare className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="outline" onClick={() => toast.info("Email flow coming soon")}><Mail className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="outline" onClick={() => toast.info("Phone flow coming soon")}><Phone className="h-3.5 w-3.5" /></Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    
  );
}
