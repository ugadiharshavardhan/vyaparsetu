import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { Category, SubCategory } from "@/types";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubCategoryRef = SubCategory & { categorySlug: string; categoryName: string };

/** Flatten every subcategory across all main categories. */
export function flattenSubCategories(categories: Category[]): SubCategoryRef[] {
  return categories.flatMap((c) =>
    (c.subCategories ?? []).map((sc) => ({
      ...sc,
      categorySlug: c.slug,
      categoryName: c.name,
    })),
  );
}

/** Hook to fetch the first product image for each subcategory */
export function useSubcategoryImages() {
  return useQuery({
    queryKey: ["subcategory-product-images"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("subcategory_id, image, images")
        .not("subcategory_id", "is", null)
        .not("image", "eq", "");
      if (error) throw error;

      const isFrontFacingImage = (url: string): boolean => {
        const lowercase = url.toLowerCase();
        const badKeywords = [
          "back",
          "label",
          "nutrition",
          "facts",
          "ingredient",
          "barcode",
          "rear",
          "side",
          "packaging-back",
          "table",
          "chart",
        ];
        return !badKeywords.some((keyword) => lowercase.includes(keyword));
      };

      const imgMap: Record<string, string> = {};
      const fallbackMap: Record<string, string> = {};

      for (const row of data || []) {
        if (!row.subcategory_id || !row.image) continue;

        // Keep track of the very first image we see for each subcategory as fallback
        if (!fallbackMap[row.subcategory_id]) {
          fallbackMap[row.subcategory_id] = row.image;
        }

        // Check if we already found a clean image for this subcategory
        if (imgMap[row.subcategory_id]) continue;

        // Test main image
        if (isFrontFacingImage(row.image)) {
          imgMap[row.subcategory_id] = row.image;
          continue;
        }

        // Test additional images
        const allImages = Array.isArray(row.images)
          ? row.images.map(String)
          : typeof row.images === "string"
          ? [row.images]
          : [];
        const cleanImg = allImages.find((img) => img && isFrontFacingImage(img));
        if (cleanImg) {
          imgMap[row.subcategory_id] = cleanImg;
        }
      }

      // Fill in fallback images for subcategories that have no clean image at all
      for (const subId of Object.keys(fallbackMap)) {
        if (!imgMap[subId]) {
          imgMap[subId] = fallbackMap[subId];
        }
      }

      return imgMap;
    },
  });
}

/** Marketplace "All" strip — shows every subcategory (not main categories). */
export function AllSubcategoriesStrip({
  title = "Shop by subcategory",
  description = "Browse every wholesale subcategory. Tap one to see its products.",
}: {
  title?: string;
  description?: string;
}) {
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: imagesMap = {}, isLoading: imgsLoading } = useSubcategoryImages();

  const isLoading = catsLoading || imgsLoading;

  const items = useMemo(() => {
    const all = flattenSubCategories(categories);
    // Filter to only those subcategories that have products (i.e. exist in the imagesMap)
    // And override the subcategory image with the real product image!
    return all
      .filter((sc) => !!imagesMap[sc.id])
      .map((sc) => ({
        ...sc,
        image: imagesMap[sc.id],
      }));
  }, [categories, imagesMap]);

  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-8 w-64" />
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-24 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section>
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((sc) => (
          <Link
            key={`${sc.categorySlug}:${sc.slug}`}
            to="/categories/$slug"
            params={{ slug: sc.categorySlug }}
            search={{ sub: sc.slug }}
            className="group flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-2 sm:w-[112px]"
          >
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary transition-all group-hover:border-brand/40 group-hover:shadow-soft">
              <CategoryImage
                src={sc.image}
                alt={sc.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="line-clamp-2 text-center text-[11px] font-semibold leading-snug text-foreground group-hover:text-brand sm:text-xs">
              {sc.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

