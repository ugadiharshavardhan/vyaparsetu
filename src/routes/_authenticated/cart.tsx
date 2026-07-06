import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoonState } from "@/components/common/ComingSoonState";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — VyaparSetu" }] }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  return (
    <div className="container-page py-10">
      <PageHeader title="Your cart" description="Bulk-order pricing and MOQ optimization." />
      <ComingSoonState
        icon={ShoppingCart}
        title="Cart is coming soon"
        description="We're wiring up bulk pricing, MOQ optimization and split-shipment logic. In the meantime, browse the marketplace."
        cta={{ label: "Browse marketplace", onClick: () => navigate({ to: "/marketplace" }) }}
      />
    </div>
  );
}
