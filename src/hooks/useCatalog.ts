import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types";
import { mapDbCategory, mapDbProduct, type DbCategory, type DbProduct } from "@/lib/catalogMap";

const PRODUCTS_KEY = ["catalog-products"] as const;
const CATEGORIES_KEY = ["catalog-categories"] as const;

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapDbProduct(row as unknown as DbProduct));
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapDbCategory(row as unknown as DbCategory));
}

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "slug", slug],
    enabled: !!slug,
    staleTime: 60_000,
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
  const q = useProducts();
  return {
    ...q,
    data: (q.data ?? []).filter((p) => p.featured).slice(0, limit),
  };
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
