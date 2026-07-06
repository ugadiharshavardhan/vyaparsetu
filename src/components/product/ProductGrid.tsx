import { motion } from "framer-motion";
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
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((p) => (
        <motion.div
          key={p.id}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
          }}
        >
          <ProductCard product={p} onQuickView={onQuickView} />
        </motion.div>
      ))}
    </motion.div>
  );
}
