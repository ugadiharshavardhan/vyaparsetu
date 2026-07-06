import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons[category.icon as keyof typeof Icons] as typeof Icons.ShoppingBasket) ?? Icons.Package;
  return (
    <Link
      to="/marketplace"
      search={{ category: category.slug } as never}
      className="group flex h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-square w-40 shrink-0 overflow-hidden">
        <img src={category.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-brand">
            {category.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{category.productCount.toLocaleString("en-IN")}+ products</span>
          <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
