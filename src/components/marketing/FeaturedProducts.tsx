import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { FEATURED_PRODUCTS } from "@/data/products";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const [quick, setQuick] = useState<Product | null>(null);
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Featured"
          title="This week's top wholesale picks"
          description="Hand-picked fast-moving SKUs across categories, from verified suppliers."
        />
        <div className="mt-12">
          <ProductGrid products={FEATURED_PRODUCTS} onQuickView={setQuick} />
        </div>
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/marketplace">
              Browse full marketplace <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <QuickViewDialog product={quick} onOpenChange={(v) => !v && setQuick(null)} />
    </section>
  );
}
