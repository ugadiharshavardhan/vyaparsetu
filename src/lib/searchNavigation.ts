import type { Category, Product } from "@/types";

function norm(value: string) {
  return value.trim().toLowerCase();
}

/** Match products for the landing / header search dialog. */
export function searchCatalogProducts(products: Product[], query: string, limit = 8): Product[] {
  const q = norm(query);
  if (!q) return [];

  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.supplier.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

/** Match categories for the search dialog. */
export function searchCatalogCategories(categories: Category[], query: string, limit = 5): Category[] {
  const q = norm(query);
  if (!q) return [];

  const slugQ = q.replace(/\s+/g, "-");
  return categories
    .filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(slugQ),
    )
    .slice(0, limit);
}

/** Unique brands from matched products. */
export function searchCatalogBrands(products: Product[], query: string, limit = 5): string[] {
  return Array.from(new Set(searchCatalogProducts(products, query, 40).map((p) => p.brand)))
    .filter(Boolean)
    .slice(0, limit);
}

export type SearchNavTarget =
  | { type: "product"; slug: string }
  | { type: "category"; slug: string }
  | { type: "marketplace"; q: string };

/** Pick the best destination for a search term (recent/trending/free text). */
export function resolveSearchTarget(
  term: string,
  products: Product[],
  categories: Category[],
): SearchNavTarget {
  const q = norm(term);
  if (!q) return { type: "marketplace", q: term };

  const exactProduct = products.find((p) => norm(p.name) === q);
  if (exactProduct) return { type: "product", slug: exactProduct.slug };

  const partialProduct = products.find(
    (p) => norm(p.name).includes(q) || q.includes(norm(p.name)),
  );
  if (partialProduct) return { type: "product", slug: partialProduct.slug };

  const slugQ = q.replace(/\s+/g, "-");
  const exactCategory = categories.find(
    (c) => norm(c.name) === q || c.slug.toLowerCase() === slugQ,
  );
  if (exactCategory) return { type: "category", slug: exactCategory.slug };

  const partialCategory = categories.find(
    (c) => norm(c.name).includes(q) || c.slug.toLowerCase().includes(slugQ),
  );
  if (partialCategory) return { type: "category", slug: partialCategory.slug };

  return { type: "marketplace", q: term.trim() };
}
