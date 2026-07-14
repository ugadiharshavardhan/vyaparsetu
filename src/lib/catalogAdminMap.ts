import type { Category, Product } from "@/types";
import type { AdminCategory, AdminProduct } from "@/data/admin";

export function mapProductToAdmin(p: Product): AdminProduct {
  return {
    id: p.sku || p.id,
    name: p.name,
    category: p.category,
    supplier: p.supplier.name,
    price: p.wholesalePrice,
    moq: p.moq,
    stock: p.stockCount,
    status: p.inStock ? "live" : "archived",
    createdAt: new Date().toISOString(),
    reports: 0,
  };
}

export function mapCategoriesToAdmin(categories: Category[]): AdminCategory[] {
  const items: AdminCategory[] = [];
  categories.forEach((c, i) => {
    items.push({
      id: c.id,
      name: c.name,
      parent: null,
      products: c.productCount,
      visible: true,
      order: i + 1,
    });
    c.subCategories.forEach((sub, j) => {
      items.push({
        id: `${c.id}:${sub.slug}`,
        name: sub.name,
        parent: c.id,
        products: 0,
        visible: true,
        order: j + 1,
      });
    });
  });
  return items;
}
