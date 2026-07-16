import type { Category, Product, SubCategory, Supplier } from "@/types";

export type DbSubcategory = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  sort_order?: number | null;
};

export type DbCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  product_count: number;
  description: string | null;
  /** Nested join from `subcategories` table (preferred). */
  subcategories?: DbSubcategory[] | null;
  /** Legacy JSON column — ignored once migration is applied. */
  sub_categories?: unknown;
};

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category_slug: string;
  sub_category: string | null;
  subcategory_id?: string | null;
  sku: string | null;
  image: string;
  images: unknown;
  wholesale_price: number | string;
  mrp: number | string;
  moq: number;
  unit: string;
  gst_included: boolean;
  gst_rate: number | string;
  supplier: unknown;
  rating: number | string;
  review_count: number;
  in_stock: boolean;
  stock_count: number;
  featured: boolean | null;
  description: string | null;
  specifications: unknown;
  highlights: unknown;
  packaging_details: string | null;
  delivery_days: number | null;
  delivery_estimate: string | null;
};

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function asSupplier(raw: unknown): Supplier {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: String(s.id ?? ""),
    name: String(s.name ?? "Supplier"),
    location: String(s.location ?? ""),
    verified: Boolean(s.verified ?? true),
    rating: num(s.rating, 4.5),
    reviewCount: s.reviewCount != null ? num(s.reviewCount) : (s.review_count != null ? num(s.review_count) : undefined),
    yearsActive: num(s.yearsActive, 1),
    logo: s.logo ? String(s.logo) : undefined,
    description: s.description ? String(s.description) : undefined,
    businessType: s.businessType as Supplier["businessType"],
    gstVerified: s.gstVerified != null ? Boolean(s.gstVerified) : undefined,
    responseRate: s.responseRate != null ? num(s.responseRate) : undefined,
    totalProducts: s.totalProducts != null ? num(s.totalProducts) : undefined,
    categories: Array.isArray(s.categories) ? (s.categories as string[]) : undefined,
    established: s.established != null ? num(s.established) : undefined,
  };
}

export function mapDbCategory(row: DbCategory): Category {
  const fromTable = Array.isArray(row.subcategories) ? row.subcategories : null;
  const fromJson = Array.isArray(row.sub_categories) ? row.sub_categories : [];
  const subs: SubCategory[] = fromTable
    ? [...fromTable]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          image: s.image ?? undefined,
          sortOrder: s.sort_order ?? undefined,
        }))
    : fromJson.map((s) => {
        const x = s as Record<string, unknown>;
        return {
          id: String(x.id ?? x.slug ?? ""),
          slug: String(x.slug ?? ""),
          name: String(x.name ?? ""),
          image: x.image ? String(x.image) : undefined,
        } satisfies SubCategory;
      });
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? "Store",
    image: row.image ?? "",
    productCount: row.product_count ?? 0,
    description: row.description ?? "",
    subCategories: subs,
  };
}

export function mapDbProduct(row: DbProduct): Product {
  const images = Array.isArray(row.images) ? row.images.map(String) : [row.image];
  const specs =
    row.specifications && typeof row.specifications === "object" && !Array.isArray(row.specifications)
      ? (row.specifications as Record<string, string>)
      : {};
  const highlights = Array.isArray(row.highlights) ? row.highlights.map(String) : [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category_slug,
    subCategory: row.sub_category ?? undefined,
    sku: row.sku ?? undefined,
    image: row.image,
    images,
    wholesalePrice: num(row.wholesale_price),
    mrp: num(row.mrp),
    moq: Math.max(1, num(row.moq, 1)),
    unit: row.unit || "unit",
    gstIncluded: Boolean(row.gst_included),
    gstRate: num(row.gst_rate, 18),
    supplier: asSupplier(row.supplier),
    rating: num(row.rating),
    reviewCount: num(row.review_count),
    inStock: Boolean(row.in_stock),
    stockCount: num(row.stock_count),
    featured: Boolean(row.featured),
    description: row.description ?? "",
    specifications: specs,
    highlights,
    packagingDetails: row.packaging_details ?? undefined,
    deliveryDays: row.delivery_days ?? undefined,
    deliveryEstimate: row.delivery_estimate ?? undefined,
  };
}
