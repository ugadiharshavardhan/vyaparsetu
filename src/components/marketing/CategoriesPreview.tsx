import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesPreview() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Categories"
        title="Everything your business needs, in one place"
        description="From daily FMCG to industrial supplies — sourced from verified sellers across India."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[5/4] rounded-2xl" />)
          : categories.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <Link
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-secondary">
                    <CategoryImage
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-center text-sm font-semibold text-foreground group-hover:text-brand">
                      {c.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
