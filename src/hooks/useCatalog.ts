import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types";
import { mapDbCategory, mapDbProduct, type DbCategory, type DbProduct } from "@/lib/catalogMap";

const PRODUCTS_KEY = ["catalog-products"] as const;
const CATEGORIES_KEY = ["catalog-categories"] as const;

/** Columns needed for cards/grids — avoid select("*") payloads. */
const PRODUCT_LIST_COLUMNS = [
  "id",
  "slug",
  "name",
  "brand",
  "category_slug",
  "sub_category",
  "subcategory_id",
  "sku",
  "image",
  "images",
  "wholesale_price",
  "mrp",
  "moq",
  "unit",
  "gst_included",
  "gst_rate",
  "supplier",
  "rating",
  "review_count",
  "in_stock",
  "stock_count",
  "featured",
  "description",
  "delivery_days",
  "delivery_estimate",
].join(",");

async function fetchProductList(options?: {
  categorySlug?: string;
  featured?: boolean;
  supplierId?: string;
  limit?: number;
}): Promise<Product[]> {
  let q = supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (options?.categorySlug) {
    q = q.eq("category_slug", options.categorySlug);
  }
  if (options?.featured) {
    q = q.eq("featured", true);
  }
  if (options?.supplierId) {
    q = q.filter("supplier->>id", "eq", options.supplierId);
  }
  if (options?.limit) {
    q = q.limit(options.limit);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => mapDbProduct(row as unknown as DbProduct));
}

async function fetchCategories(): Promise<Category[]> {
  const withJoin = await supabase
    .from("categories")
    .select(
      "id, slug, name, icon, image, product_count, description, subcategories(id, slug, name, image, sort_order)",
    )
    .order("name", { ascending: true });

  if (!withJoin.error) {
    return (withJoin.data ?? []).map((row) => mapDbCategory(row as unknown as DbCategory));
  }

  // Fallback before subcategories migration is applied
  const legacy = await supabase
    .from("categories")
    .select("id, slug, name, icon, image, product_count, description, sub_categories")
    .order("name", { ascending: true });
  if (legacy.error) throw withJoin.error;
  return (legacy.data ?? []).map((row) => mapDbCategory(row as unknown as DbCategory));
}

/** Marketplace / browse list — projected columns, capped for fast first paint. */
export function useProducts(options?: { limit?: number; enabled?: boolean }) {
  const limit = options?.limit ?? 120;
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", limit],
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60_000,
    queryFn: () => fetchProductList({ limit }),
  });
}

/** Uncapped projected catalog for seller/admin management screens. */
export function useAllProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "all"],
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60_000,
    queryFn: () => fetchProductList(),
  });
}

export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    enabled: options?.enabled ?? true,
    staleTime: 10 * 60_000,
    queryFn: fetchCategories,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "slug", slug],
    enabled: !!slug,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data as unknown as DbProduct) : null;
    },
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "featured", limit],
    staleTime: 5 * 60_000,
    queryFn: () => fetchProductList({ featured: true, limit }),
  });
}

export function useProductsByCategory(categorySlug: string | undefined, limit = 96) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "category", categorySlug, limit],
    enabled: !!categorySlug,
    staleTime: 5 * 60_000,
    queryFn: () => fetchProductList({ categorySlug: categorySlug!, limit }),
  });
}

export function useProductsBySupplier(supplierId: string | undefined, limit = 96) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "supplier", supplierId, limit],
    enabled: !!supplierId,
    staleTime: 5 * 60_000,
    queryFn: () => fetchProductList({ supplierId: supplierId!, limit }),
  });
}

export function useRelatedProducts(product: Product | null | undefined, limit = 8) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "related", product?.id, product?.category, limit],
    enabled: !!product?.id && !!product.category,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_COLUMNS)
        .eq("category_slug", product!.category)
        .neq("id", product!.id)
        .order("featured", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => mapDbProduct(row as unknown as DbProduct));
    },
  });
}

/**
 * "You might also like" based on categories of items currently in the cart.
 * Falls back to looking up category_slug from product ids when snapshot lacks category.
 */
export function useCartRelatedProducts(options?: {
  excludeIds?: string[];
  categoryHints?: string[];
  limit?: number;
  enabled?: boolean;
}) {
  const limit = options?.limit ?? 8;
  const excludeIds = Array.from(new Set((options?.excludeIds ?? []).filter(Boolean)));
  const categoryHints = Array.from(
    new Set((options?.categoryHints ?? []).map((c) => c.trim()).filter(Boolean)),
  );

  return useQuery({
    queryKey: [
      ...PRODUCTS_KEY,
      "cart-related",
      categoryHints.slice().sort().join(","),
      excludeIds.slice().sort().join(","),
      limit,
    ],
    enabled: (options?.enabled ?? true) && (categoryHints.length > 0 || excludeIds.length > 0),
    staleTime: 60_000,
    queryFn: async (): Promise<Product[]> => {
      let categories = categoryHints;

      // Older cart rows may not store category — resolve from product ids
      if (!categories.length && excludeIds.length) {
        const { data: rows, error } = await supabase
          .from("products")
          .select("id, category_slug")
          .in("id", excludeIds.slice(0, 20));
        if (error) throw error;
        categories = Array.from(
          new Set((rows ?? []).map((r) => String(r.category_slug ?? "")).filter(Boolean)),
        );
      }

      if (!categories.length) return [];

      // Fetch per category so PostgREST .in + neq stays simple and reliable
      const batches = await Promise.all(
        categories.slice(0, 4).map(async (slug) => {
          let q = supabase
            .from("products")
            .select(PRODUCT_LIST_COLUMNS)
            .eq("category_slug", slug)
            .order("featured", { ascending: false })
            .limit(limit);
          if (excludeIds.length) {
            // PostgREST: not.in.(id1,id2)
            q = q.not("id", "in", `(${excludeIds.join(",")})`);
          }
          const { data, error } = await q;
          if (error) throw error;
          return (data ?? []).map((row) => mapDbProduct(row as unknown as DbProduct));
        }),
      );

      const seen = new Set(excludeIds);
      const out: Product[] = [];
      for (const batch of batches) {
        for (const p of batch) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          out.push(p);
          if (out.length >= limit) return out;
        }
      }
      return out;
    },
  });
}

export function useProductsByIds(ids: string[] | undefined) {
  const unique = Array.from(new Set((ids ?? []).filter(Boolean))).slice(0, 12);
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "by-ids", unique.slice().sort().join(",")],
    enabled: unique.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_COLUMNS)
        .in("id", unique);
      if (error) throw error;
      const mapped = (data ?? []).map((row) => mapDbProduct(row as unknown as DbProduct));
      // Preserve recently-viewed order
      const byId = new Map(mapped.map((p) => [p.id, p]));
      return unique.map((id) => byId.get(id)).filter(Boolean) as Product[];
    },
  });
}

export function getRelatedFromList(products: Product[], product: Product, limit = 4) {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

export function getByCategory(products: Product[], slug: string) {
  return products.filter((p) => p.category === slug);
}

export function getBySupplier(products: Product[], supplierId: string) {
  return products.filter((p) => p.supplier.id === supplierId);
}

export function getCategoryFromList(categories: Category[], slug: string | null | undefined) {
  if (!slug) return undefined;
  return categories.find((c) => c.slug === slug);
}

export function getSubCategoryName(categories: Category[], categorySlug: string, subSlug: string) {
  return getCategoryFromList(categories, categorySlug)?.subCategories.find((s) => s.slug === subSlug)?.name;
}
