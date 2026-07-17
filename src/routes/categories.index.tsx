import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Categories — VyaparSetu" },
      {
        name: "description",
        content:
          "Browse wholesale business categories on VyaparSetu — Food & FMCG, Healthcare, Electronics, Home & Kitchen and more.",
      },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="container-page py-12 md:py-16">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/marketplace" className="cursor-pointer hover:text-brand">
          Marketplace
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Categories</span>
      </nav>
      <SectionHeading
        align="left"
        eyebrow="Wholesale categories"
        title="Shop by business category"
        description="B2B categories for retailers, kiranas and HORECA — browse SKUs by the way you restock."
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
          : categories.map((c, i) => (
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
