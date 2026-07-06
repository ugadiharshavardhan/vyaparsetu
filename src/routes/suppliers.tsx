import { createFileRoute } from "@tanstack/react-router";
import { MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Button } from "@/components/ui/button";

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
  const unique = Array.from(new Map(PRODUCTS.map((p) => [p.supplier.id, p.supplier])).values());

  return (
    <div className="container-page py-12 md:py-16">
      <SectionHeading
        align="left"
        eyebrow="Suppliers"
        title="Verified suppliers across India"
        description="Every supplier is GST, PAN and warehouse verified before onboarding."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {unique.map((s) => {
          const products = PRODUCTS.filter((p) => p.supplier.id === s.id);
          return (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-lg font-bold text-white shadow-brand">
                  {s.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    {s.verified && <VerifiedBadge />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {s.location}
                  </div>
                  <div className="mt-2"><Rating value={s.rating} /></div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-xs">
                <div>
                  <div className="font-semibold text-foreground">{products.length}</div>
                  <div className="text-muted-foreground">SKUs</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{s.yearsActive}yr</div>
                  <div className="text-muted-foreground">On platform</div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-0.5 font-semibold text-brand">
                    <TrendingUp className="h-3 w-3" /> A+
                  </div>
                  <div className="text-muted-foreground">Trust score</div>
                </div>
              </div>
              <Button variant="outline" className="mt-5 w-full">
                <ShieldCheck className="mr-1.5 h-4 w-4" /> View store
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
