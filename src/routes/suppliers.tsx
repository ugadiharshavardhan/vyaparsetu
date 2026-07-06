import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SUPPLIERS } from "@/data/suppliers";
import { getProductsBySupplier } from "@/data/products";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SupplierCard } from "@/components/marketplace/SupplierCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Top Suppliers — VyaparSetu" },
      { name: "description", content: "Meet 12,500+ verified manufacturers, distributors and wholesalers on VyaparSetu." },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SUPPLIERS;
    return SUPPLIERS.filter((s) =>
      s.name.toLowerCase().includes(t) ||
      s.location.toLowerCase().includes(t) ||
      s.businessType?.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <div className="container-page py-12 md:py-16">
      <SectionHeading
        align="left"
        eyebrow="Suppliers"
        title="Verified suppliers across India"
        description="Every supplier is GST, PAN and warehouse verified before onboarding."
      />

      <div className="mt-8 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by supplier name, city or business type…"
            className="h-11 rounded-full border-border bg-card pl-10 shadow-soft"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SupplierCard key={s.id} supplier={s} productCount={getProductsBySupplier(s.id).length} />
        ))}
      </div>
    </div>
  );
}
