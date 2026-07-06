import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/data/categories";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CategoryCard } from "@/components/marketplace/CategoryCard";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — VyaparSetu" },
      { name: "description", content: "Explore all wholesale categories on VyaparSetu — FMCG, staples, personal care, industrial and more." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <SectionHeading
        align="left"
        eyebrow="Explore"
        title="All wholesale categories"
        description="10 major categories, 2.5L+ SKUs, 12,500+ verified suppliers."
      />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
          >
            <CategoryCard category={c} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
