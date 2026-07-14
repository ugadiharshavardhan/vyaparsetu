import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { useFeaturedProducts } from "@/hooks/useCatalog";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const [quick, setQuick] = useState<Product | null>(null);
  const { data: featured = [], isLoading } = useFeaturedProducts(8);

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Featured"
          title="This week's top wholesale picks"
          description="Hand-picked fast-moving SKUs across categories, from verified suppliers."
        />
        <div className="mt-12">
          {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={featured} onQuickView={setQuick} />}
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
