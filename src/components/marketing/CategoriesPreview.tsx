import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { SectionHeading } from "@/components/common/SectionHeading";

type LucideName = keyof typeof Icons;

export function CategoriesPreview() {
  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Categories"
        title="Everything your business needs, in one place"
        description="From daily FMCG to industrial supplies — sourced from verified sellers across India."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c, i) => {
          const Icon = (Icons[c.icon as LucideName] as typeof Icons.ShoppingBasket) ?? Icons.Package;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <Link
                to="/marketplace"
                search={{ category: c.slug } as never}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="relative aspect-[5/4] overflow-hidden">
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-brand shadow-soft backdrop-blur">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-brand">
                    {c.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.productCount.toLocaleString("en-IN")}+ products</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
