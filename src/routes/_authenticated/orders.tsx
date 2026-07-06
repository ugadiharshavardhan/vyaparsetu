import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoonState } from "@/components/common/ComingSoonState";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — VyaparSetu" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="container-page py-10">
      <PageHeader title="Orders" description="Track every purchase, invoice and delivery." />
      <ComingSoonState
        icon={PackageSearch}
        title="No orders yet"
        description="Once you place your first order it will appear here with live tracking and GST invoices."
      />
    </div>
  );
}
