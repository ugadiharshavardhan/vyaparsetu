import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/supplier/DataTable";
import { useSupplierProducts } from "@/hooks/useSupplier";
import type { SupplierProduct } from "@/types/supplier";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/supplier/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Supplier" }] }),
  component: PricingPage,
});

function PricingPage() {
  const { products, updateProduct } = useSupplierProducts();
  const [drafts, setDrafts] = useState<Record<string, { wp: number; mrp: number }>>({});

  const set = (id: string, key: "wp" | "mrp", value: number) => {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? { wp: 0, mrp: 0 }), [key]: value } }));
  };
  const save = (p: SupplierProduct) => {
    const d = drafts[p.id];
    if (!d) return;
    void updateProduct(p.id, { wholesalePrice: d.wp || p.wholesalePrice, mrp: d.mrp || p.mrp })
      .then(() => toast.success("Pricing updated"))
      .catch((e: Error) => toast.error(e.message));
  };

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Pricing" description="Tune wholesale, MRP and bulk-tier pricing across your catalog." />

        <div className="grid gap-4 md:grid-cols-3">
          <SectionCard title="Bulk discount tiers" description="Applied to all products with MOQ">
            <div className="space-y-2 text-sm">
              <TierRow label="10-49 units" value="0%" />
              <TierRow label="50-99 units" value="5%" />
              <TierRow label="100-249 units" value="8%" />
              <TierRow label="250+ units" value="12%" />
            </div>
          </SectionCard>
          <SectionCard title="Festival offers" description="Auto-apply during festivals">
            <div className="space-y-2 text-sm">
              <TierRow label="Diwali" value="10% off" />
              <TierRow label="Republic Day" value="6% off" />
              <TierRow label="Independence Day" value="7% off" />
            </div>
          </SectionCard>
          <SectionCard title="Promotional pricing" description="Manual overrides in effect">
            <p className="text-sm text-muted-foreground">2 promotions currently active. Manage them from the Promotions page.</p>
          </SectionCard>
        </div>

        <SectionCard title="Per-product pricing" description="Update wholesale price and MRP inline">
          <DataTable<SupplierProduct>
            rows={products}
            columns={[
              { key: "prod", header: "Product", cell: (p) => <div className="min-w-0"><div className="truncate font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">SKU {p.sku}</div></div> },
              {
                key: "wp",
                header: "Wholesale price",
                cell: (p) => (
                  <div className="w-32">
                    <Label className="sr-only">Wholesale</Label>
                    <Input type="number" defaultValue={p.wholesalePrice} onChange={(e) => set(p.id, "wp", Number(e.target.value))} />
                  </div>
                ),
              },
              {
                key: "mrp",
                header: "MRP",
                cell: (p) => (
                  <div className="w-32">
                    <Label className="sr-only">MRP</Label>
                    <Input type="number" defaultValue={p.mrp} onChange={(e) => set(p.id, "mrp", Number(e.target.value))} />
                  </div>
                ),
              },
              {
                key: "disc",
                header: "Discount",
                cell: (p) => {
                  const d = drafts[p.id];
                  const wp = d?.wp || p.wholesalePrice;
                  const mrp = d?.mrp || p.mrp;
                  const pct = mrp > wp ? Math.round(((mrp - wp) / mrp) * 100) : 0;
                  return <span className="font-semibold text-success">{pct}%</span>;
                },
              },
              { key: "current", header: "Current", cell: (p) => <span className="text-xs text-muted-foreground">{inr(p.wholesalePrice)} / {inr(p.mrp)}</span> },
              {
                key: "save",
                header: "",
                className: "text-right",
                cell: (p) => <Button size="sm" variant="outline" onClick={() => save(p)}>Save</Button>,
              },
            ]}
          />
        </SectionCard>
      </div>
    
  );
}

function TierRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
