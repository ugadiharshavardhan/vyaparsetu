import type { Product } from "@/types";
import type { SupplierProduct } from "@/types/supplier";
import type { Database } from "@/integrations/supabase/types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export function mapCatalogProductToSupplier(p: Product): SupplierProduct {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    sku: p.sku ?? p.slug.toUpperCase(),
    hsn: "",
    category: p.category,
    subCategory: p.subCategory ?? "",
    gstRate: p.gstRate,
    description: p.description,
    highlights: p.highlights ?? [],
    specifications: p.specifications ?? {},
    countryOfOrigin: "India",
    images: p.images?.length ? p.images : [p.image],
    thumbnailIndex: 0,
    moq: p.moq,
    unit: p.unit,
    packageSize: p.packagingDetails ?? "",
    wholesalePrice: p.wholesalePrice,
    mrp: p.mrp,
    stock: p.stockCount,
    reserved: 0,
    incoming: 0,
    warehouseId: "",
    deliveryDays: p.deliveryDays ?? 3,
    returnPolicy: "7-day return for damaged packaging",
    warranty: "N/A",
    featured: Boolean(p.featured),
    visible: true,
    status: p.inStock ? "published" : "archived",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function slugifyProductName(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `product-${Date.now()}`;
}

export function supplierDraftToInsert(
  draft: Omit<SupplierProduct, "id" | "createdAt" | "updatedAt">,
  id: string,
  supplier?: Product["supplier"],
): ProductInsert {
  const images = draft.images.length ? draft.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=70"];
  const slug = `${slugifyProductName(draft.name)}-${id}`;
  return {
    id,
    slug,
    name: draft.name,
    brand: draft.brand || "Brand",
    category_slug: draft.category,
    sub_category: draft.subCategory || null,
    sku: draft.sku || null,
    image: images[draft.thumbnailIndex] ?? images[0],
    images,
    wholesale_price: draft.wholesalePrice,
    mrp: draft.mrp,
    moq: Math.max(1, draft.moq),
    unit: draft.unit || "unit",
    gst_included: true,
    gst_rate: draft.gstRate,
    supplier: (supplier ?? {}) as ProductInsert["supplier"],
    rating: 0,
    review_count: 0,
    in_stock: draft.stock > 0 && draft.status !== "archived",
    stock_count: Math.max(0, draft.stock),
    featured: draft.featured,
    description: draft.description || null,
    specifications: draft.specifications,
    highlights: draft.highlights,
    packaging_details: draft.packageSize || null,
    delivery_days: draft.deliveryDays,
  };
}

export function supplierPatchToUpdate(patch: Partial<SupplierProduct>): ProductUpdate {
  const update: ProductUpdate = {};
  if (patch.name != null) update.name = patch.name;
  if (patch.brand != null) update.brand = patch.brand;
  if (patch.category != null) update.category_slug = patch.category;
  if (patch.subCategory != null) update.sub_category = patch.subCategory || null;
  if (patch.sku != null) update.sku = patch.sku || null;
  if (patch.images != null) {
    const images = patch.images.length ? patch.images : undefined;
    if (images) {
      update.images = images;
      const idx = patch.thumbnailIndex ?? 0;
      update.image = images[idx] ?? images[0];
    }
  }
  if (patch.wholesalePrice != null) update.wholesale_price = patch.wholesalePrice;
  if (patch.mrp != null) update.mrp = patch.mrp;
  if (patch.moq != null) update.moq = Math.max(1, patch.moq);
  if (patch.unit != null) update.unit = patch.unit;
  if (patch.gstRate != null) update.gst_rate = patch.gstRate;
  if (patch.stock != null) {
    update.stock_count = Math.max(0, patch.stock);
    update.in_stock = patch.stock > 0;
  }
  if (patch.featured != null) update.featured = patch.featured;
  if (patch.description != null) update.description = patch.description;
  if (patch.specifications != null) update.specifications = patch.specifications;
  if (patch.highlights != null) update.highlights = patch.highlights;
  if (patch.packageSize != null) update.packaging_details = patch.packageSize || null;
  if (patch.deliveryDays != null) update.delivery_days = patch.deliveryDays;
  if (patch.status === "archived") update.in_stock = false;
  if (patch.status === "published") update.in_stock = true;
  return update;
}
