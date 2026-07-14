import type { Product } from "@/types";
import type { Filters } from "@/components/marketplace/FilterSidebar";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export function filterProducts(
  products: Product[],
  filters: Filters,
  query = "",
): Product[] {
  const q = query.trim().toLowerCase();
  const loc = filters.location.trim().toLowerCase();

  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.subCategory && p.subCategory !== filters.subCategory) return false;
    if (p.wholesalePrice > filters.priceMax) return false;
    if (p.moq > filters.moqMax) return false;
    if (p.rating < filters.minRating) return false;
    if (filters.maxDeliveryDays != null && (p.deliveryDays ?? 99) > filters.maxDeliveryDays) return false;
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (filters.suppliers.length && !filters.suppliers.includes(p.supplier.id)) return false;
    if (filters.gstRates.length && !filters.gstRates.includes(p.gstRate)) return false;
    if (filters.verifiedOnly && !p.supplier.verified) return false;
    if (filters.gstOnly && !p.gstIncluded) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (loc && !p.supplier.location.toLowerCase().includes(loc)) return false;
    if (
      q &&
      !(
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.supplier.name.toLowerCase().includes(q)
      )
    ) {
      return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  switch (sort) {
    case "price-asc":
      return [...list].sort((a, b) => a.wholesalePrice - b.wholesalePrice);
    case "price-desc":
      return [...list].sort((a, b) => b.wholesalePrice - a.wholesalePrice);
    case "rating":
      return [...list].sort((a, b) => b.rating - a.rating);
    case "newest":
      return [...list].reverse();
    default:
      return [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}
