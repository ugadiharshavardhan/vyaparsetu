import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { SectionHeading } from "@/components/common/SectionHeading";

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
        {CATEGORIES.map((c, i) => {
          const Icon = (Icons[c.icon as keyof typeof Icons] as typeof Icons.ShoppingBasket) ?? Icons.Package;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <Link
                to="/marketplace"
                search={{ category: c.slug } as never}
                className="group flex h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="relative aspect-square w-40 shrink-0 overflow-hidden">
                  <img src={c.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-brand">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.productCount.toLocaleString("en-IN")}+ products</span>
                    <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
