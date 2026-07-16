import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  onQuickView,
}: {
  products: Product[];
  onQuickView?: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <div key={p.id}>
          <ProductCard product={p} onQuickView={onQuickView} />
        </div>
      ))}
    </div>
  );
}
