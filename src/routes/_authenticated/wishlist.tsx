import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoonState } from "@/components/common/ComingSoonState";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — VyaparSetu" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const navigate = useNavigate();
  return (
    <div className="container-page py-10">
      <PageHeader title="Wishlist" description="Save products to compare across suppliers." />
      <ComingSoonState
        icon={Heart}
        title="Wishlist is coming soon"
        description="Save products, compare suppliers side by side and set price-drop alerts."
        cta={{ label: "Browse products", onClick: () => navigate({ to: "/marketplace" }) }}
      />
    </div>
  );
}
