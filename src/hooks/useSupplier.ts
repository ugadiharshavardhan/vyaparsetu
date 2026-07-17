import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  seedCustomers,
  seedMovements,
  seedNotifications,
  seedPromotions,
  seedReviews,
  seedWarehouses,
} from "@/data/supplierSeed";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mapDbProduct, type DbProduct } from "@/lib/catalogMap";
import {
  mapCatalogProductToSupplier,
  resolveSubcategoryId,
  supplierDraftToInsert,
  supplierPatchToUpdate,
} from "@/lib/supplierProductMap";
import type {
  Promotion,
  StockMovement,
  SupplierCustomer,
  SupplierNotification,
  SupplierProduct,
  SupplierReview,
  Warehouse,
  SupplierOrder,
  SupplierRFQ,
} from "@/types/supplier";
const KEY = "vs.supplier.v1";
const PRODUCTS_KEY = ["catalog-products"] as const;
const SELLER_PRODUCTS_KEY = ["seller-products"] as const;
const SELLER_ORDERS_KEY = ["seller-orders"] as const;

type Store = {
  warehouses: Warehouse[];
  movements: StockMovement[];
  promotions: Promotion[];
  notifications: SupplierNotification[];
  reviews: SupplierReview[];
  customers: SupplierCustomer[];
};

const defaultStore = (): Store => ({
  warehouses: seedWarehouses,
  movements: seedMovements,
  promotions: seedPromotions,
  notifications: seedNotifications,
  reviews: seedReviews,
  customers: seedCustomers,
});

function readStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<Store> & { products?: unknown };
    const { products: _ignore, ...rest } = parsed;
    void _ignore;
    return { ...defaultStore(), ...rest };
  } catch {
    return defaultStore();
  }
}

const listeners = new Set<() => void>();
let cache: Store | null = null;

function getStore(): Store {
  if (!cache) cache = readStore();
  return cache;
}

function writeStore(next: Store) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function useStore(): [Store, (updater: (s: Store) => Store) => void] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const update = useCallback((updater: (s: Store) => Store) => {
    writeStore(updater(getStore()));
  }, []);
  return [getStore(), update];
}

const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;

async function updateOwnedProduct(
  sellerId: string,
  productId: string,
  patch: Record<string, unknown>,
) {
  let { error } = await supabase
    .from("products")
    .update(patch as never)
    .eq("id", productId)
    .eq("seller_id", sellerId);
  if (!error) return;
  if (!String(error.message).includes("seller_id")) throw error;
  ({ error } = await supabase
    .from("products")
    .update(patch as never)
    .eq("id", productId)
    .filter("supplier->>id", "eq", sellerId));
  if (error) throw error;
}

async function deleteOwnedProduct(sellerId: string, productId: string) {
  let { error } = await supabase.from("products").delete().eq("id", productId).eq("seller_id", sellerId);
  if (!error) return;
  if (!String(error.message).includes("seller_id")) throw error;
  ({ error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .filter("supplier->>id", "eq", sellerId));
  if (error) throw error;
}

async function fetchSellerOwnedProducts(sellerId: string): Promise<SupplierProduct[]> {
  const bySellerColumn = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (!bySellerColumn.error && (bySellerColumn.data?.length ?? 0) > 0) {
    return (bySellerColumn.data ?? []).map((row) =>
      mapCatalogProductToSupplier(mapDbProduct(row as unknown as DbProduct)),
    );
  }

  const bySupplierJson = await supabase
    .from("products")
    .select("*")
    .filter("supplier->>id", "eq", sellerId)
    .order("created_at", { ascending: false });

  if (!bySupplierJson.error && (bySupplierJson.data?.length ?? 0) > 0) {
    return (bySupplierJson.data ?? []).map((row) =>
      mapCatalogProductToSupplier(mapDbProduct(row as unknown as DbProduct)),
    );
  }

  if (!bySellerColumn.error) {
    return (bySellerColumn.data ?? []).map((row) =>
      mapCatalogProductToSupplier(mapDbProduct(row as unknown as DbProduct)),
    );
  }

  const owned = await supabase
    .from("seller_products")
    .select("product_id, created_at, updated_at, products(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (owned.error) throw bySellerColumn.error;
  return (owned.data ?? [])
    .map((row) => {
      const raw = row.products as unknown as DbProduct | DbProduct[] | null;
      const productRow = Array.isArray(raw) ? raw[0] : raw;
      if (!productRow) return null;
      const mapped = mapCatalogProductToSupplier(mapDbProduct(productRow));
      return {
        ...mapped,
        createdAt: row.created_at ?? mapped.createdAt,
        updatedAt: row.updated_at ?? mapped.updatedAt,
      };
    })
    .filter(Boolean) as SupplierProduct[];
}

/* ---------- Products (seller-owned only) ---------- */
export function useSupplierProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...SELLER_PRODUCTS_KEY, user?.id ?? "anon"],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: () => fetchSellerOwnedProducts(user!.id),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_KEY });
    await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
  };

  const create = async (p: Omit<SupplierProduct, "id" | "createdAt" | "updatedAt">) => {
    if (!user?.id) throw new Error("Sign in as a seller to create products");
    const id = uid("p");
    const row = supplierDraftToInsert(p, id, { sellerId: user.id });
    const subcategoryId = await resolveSubcategoryId(p.category, p.subCategory);
    if (subcategoryId) {
      (row as Record<string, unknown>).subcategory_id = subcategoryId;
    }
    let { error } = await supabase.from("products").insert(row as never);
    if (error && String(error.message).includes("subcategory_id")) {
      const { subcategory_id: _dropSub, ...withoutSub } = row as Record<string, unknown>;
      void _dropSub;
      ({ error } = await supabase.from("products").insert(withoutSub as never));
    }
    if (error) throw error;

    const { error: linkErr } = await supabase.from("seller_products").insert({
      id,
      seller_id: user.id,
      product_id: id,
    } as never);
    // Ownership table may not be migrated yet — products.seller_id still scopes the catalog
    void linkErr;

    await invalidate();
    return id;
  };

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    updateProduct: async (id: string, patch: Partial<SupplierProduct>) => {
      if (!user?.id) throw new Error("Sign in as a seller to update products");
      const update = supplierPatchToUpdate(patch);

      if (patch.category != null || patch.subCategory != null) {
        let categorySlug = patch.category;
        if (!categorySlug) {
          const { data: current } = await supabase
            .from("products")
            .select("category_slug")
            .eq("id", id)
            .maybeSingle();
          categorySlug = current?.category_slug ?? undefined;
        }
        const subSlug = patch.subCategory;
        if (categorySlug && subSlug) {
          const subcategoryId = await resolveSubcategoryId(categorySlug, subSlug);
          if (subcategoryId) {
            (update as Record<string, unknown>).subcategory_id = subcategoryId;
          }
        } else if (patch.subCategory === "") {
          (update as Record<string, unknown>).subcategory_id = null;
        }
      }

      // Compare new stock with existing DB count, then set absolute (increase or decrease)
      if (patch.stock != null) {
        const { data: currentRow } = await supabase
          .from("products")
          .select("stock_count")
          .eq("id", id)
          .maybeSingle();
        const existing = Math.max(0, Number(currentRow?.stock_count ?? 0));
        const next = Math.max(0, patch.stock);
        update.stock_count = next;
        update.in_stock = next > 0;
        if (next === existing) {
          // no stock change — leave other fields to update
        }
      }

      if (Object.keys(update).length === 0) return;
      await updateOwnedProduct(user.id, id, update as Record<string, unknown>);
      await supabase
        .from("seller_products")
        .update({ updated_at: new Date().toISOString() } as never)
        .eq("product_id", id)
        .eq("seller_id", user.id);
      await invalidate();
    },
    remove: async (id: string) => {
      if (!user?.id) throw new Error("Sign in as a seller to delete products");
      await supabase.from("seller_products").delete().eq("product_id", id).eq("seller_id", user.id);
      await deleteOwnedProduct(user.id, id);
      await invalidate();
    },
    duplicate: async (id: string) => {
      const original = (query.data ?? []).find((p) => p.id === id);
      if (!original) return;
      const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = original;
      void _id;
      void _c;
      void _u;
      await create({
        ...draft,
        name: `${draft.name} (Copy)`,
        sku: `${draft.sku}-COPY`,
        status: "draft",
      });
    },
  };
}

export function useSupplierProduct(id: string) {
  const { products, isLoading } = useSupplierProducts();
  return { product: products.find((p) => p.id === id), isLoading };
}

/* ---------- Warehouses ---------- */
export function useWarehouses() {
  const [store, update] = useStore();
  return {
    warehouses: store.warehouses,
    create: (w: Omit<Warehouse, "id" | "createdAt" | "used">) =>
      update((s) => ({
        ...s,
        warehouses: [{ ...w, id: uid("wh"), used: 0, createdAt: new Date().toISOString() }, ...s.warehouses],
      })),
    updateWarehouse: (id: string, patch: Partial<Warehouse>) =>
      update((s) => ({
        ...s,
        warehouses: s.warehouses.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      })),
    remove: (id: string) => update((s) => ({ ...s, warehouses: s.warehouses.filter((w) => w.id !== id) })),
  };
}

/* ---------- Stock ---------- */
export function useStockMovements() {
  const [store, update] = useStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return {
    movements: store.movements,
    adjust: async (product: SupplierProduct, qty: number, note: string, type: StockMovement["type"] = "adjustment") => {
      if (!user?.id) throw new Error("Sign in as a seller to adjust stock");
      // qty is the delta vs existing stock (positive = increase, negative = decrease)
      const { data: currentRow } = await supabase
        .from("products")
        .select("stock_count")
        .eq("id", product.id)
        .maybeSingle();
      const existing = Math.max(0, Number(currentRow?.stock_count ?? product.stock));
      const nextStock = Math.max(0, existing + qty);
      await updateOwnedProduct(user.id, product.id, {
        stock_count: nextStock,
        in_stock: nextStock > 0,
      });
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_KEY });
      update((s) => ({
        ...s,
        movements: [
          {
            id: uid("m"),
            productId: product.id,
            productName: product.name,
            type,
            qty: nextStock - existing,
            note,
            createdAt: new Date().toISOString(),
          },
          ...s.movements,
        ].slice(0, 200),
      }));
    },
    /** Set absolute stock; compares with existing and applies increase/decrease. */
    setStock: async (product: SupplierProduct, newStock: number, note: string) => {
      if (!user?.id) throw new Error("Sign in as a seller to adjust stock");
      const { data: currentRow } = await supabase
        .from("products")
        .select("stock_count")
        .eq("id", product.id)
        .maybeSingle();
      const existing = Math.max(0, Number(currentRow?.stock_count ?? product.stock));
      const next = Math.max(0, Math.floor(newStock));
      const delta = next - existing;
      if (delta === 0) return;
      await updateOwnedProduct(user.id, product.id, {
        stock_count: next,
        in_stock: next > 0,
      });
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_KEY });
      update((s) => ({
        ...s,
        movements: [
          {
            id: uid("m"),
            productId: product.id,
            productName: product.name,
            type: delta > 0 ? "restock" : "adjustment",
            qty: delta,
            note: note || (delta > 0 ? `Stock increased by ${delta}` : `Stock decreased by ${Math.abs(delta)}`),
            createdAt: new Date().toISOString(),
          },
          ...s.movements,
        ].slice(0, 200),
      }));
    },
  };
}

/* ---------- Promotions ---------- */
export function usePromotions() {
  const [store, update] = useStore();
  return {
    promotions: store.promotions,
    create: (p: Omit<Promotion, "id" | "redemptions">) =>
      update((s) => ({ ...s, promotions: [{ ...p, id: uid("pr"), redemptions: 0 }, ...s.promotions] })),
    toggle: (id: string) =>
      update((s) => ({
        ...s,
        promotions: s.promotions.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
      })),
    remove: (id: string) => update((s) => ({ ...s, promotions: s.promotions.filter((p) => p.id !== id) })),
  };
}

/* ---------- Notifications ---------- */
export function useSupplierNotifications() {
  const [store, update] = useStore();
  return {
    notifications: store.notifications,
    markAllRead: () =>
      update((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    toggle: (id: string) =>
      update((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
      })),
  };
}

/* ---------- Reviews ---------- */
export function useSupplierReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["supplier-reviews", user?.id ?? "anon"],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          id,
          product_id,
          buyer_id,
          rating,
          comment,
          reply,
          created_at,
          updated_at,
          products!inner(
            name,
            seller_id
          ),
          buyers (
            full_name
          )
        `)
        .eq("products.seller_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        productName: row.products?.name ?? "Product",
        customer: row.buyers?.full_name ?? "Retailer",
        rating: row.rating,
        comment: row.comment ?? "",
        reply: row.reply,
        createdAt: row.created_at,
      }));
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (vars: { id: string; reply: string }) => {
      const { error } = await supabase
        .from("product_reviews")
        .update({ reply: vars.reply } as any)
        .eq("id", vars.id);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["supplier-reviews", user?.id] });
    },
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    reply: async (id: string, text: string) => {
      await replyMutation.mutateAsync({ id, reply: text });
    },
  };
}

/* ---------- Customers (real buyers who ordered this seller's items) ---------- */
const SELLER_BUYERS_KEY = ["seller-buyers"] as const;

type DbSellerBuyer = {
  buyer_id: string;
  name: string | null;
  business: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  city: string | null;
  address: string | null;
  orders: number | null;
  spent: number | null;
  last_order_at: string | null;
  favorite_product: string | null;
};

function mapDbSellerBuyer(row: DbSellerBuyer): SupplierCustomer {
  const orders = Number(row.orders ?? 0);
  const lastOrderAt = row.last_order_at ?? new Date().toISOString();
  // A buyer is "active" if they ordered within the last 90 days.
  const daysSince = (Date.now() - Date.parse(lastOrderAt)) / (1000 * 60 * 60 * 24);
  return {
    id: row.buyer_id,
    name: row.name || "Buyer",
    business: row.business || row.name || "Buyer",
    city: row.city || "—",
    orders,
    spent: Number(row.spent ?? 0),
    lastOrderAt,
    favoriteProduct: row.favorite_product || "—",
    gstNumber: row.gst_number || undefined,
    address: row.address || undefined,
    ownerName: row.name || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    status: Number.isFinite(daysSince) && daysSince > 90 ? "inactive" : "active",
  };
}

export function useSupplierCustomers() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...SELLER_BUYERS_KEY, user?.id ?? "anon"],
    enabled: !!user?.id,
    staleTime: 20_000,
    queryFn: async (): Promise<SupplierCustomer[]> => {
      const { data, error } = await supabase.rpc("get_seller_buyers");
      if (error) throw error;
      return ((data ?? []) as DbSellerBuyer[]).map(mapDbSellerBuyer);
    },
  });

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/* ---------- Supplier orders (real buyer orders for this seller's SKUs) ---------- */

type DbOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

function mapDbStatusToSupplier(status: string): SupplierOrder["status"] {
  switch (status as DbOrderStatus) {
    case "pending":
      return "pending";
    case "confirmed":
      return "accepted";
    case "processing":
      return "packing";
    case "packed":
      return "ready";
    case "out_for_delivery":
      return "picked_up";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "returned":
    case "return_requested":
      return "returned";
    default:
      return "pending";
  }
}

function mapSupplierStatusToDb(status: SupplierOrder["status"]): DbOrderStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "accepted":
      return "confirmed";
    case "packing":
      return "processing";
    case "ready":
      return "packed";
    case "picked_up":
      return "out_for_delivery";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "returned":
      return "returned";
    default:
      return "confirmed";
  }
}

function destinationFromAddress(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "—";
  const a = addr as Record<string, unknown>;
  const city = String(a.city ?? "");
  const state = String(a.state ?? "");
  if (city && state) return `${city}, ${state}`;
  return city || state || String(a.line1 ?? "—");
}

function customerFromAddress(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "Buyer";
  const a = addr as Record<string, unknown>;
  return String(a.contact_name ?? a.label ?? "Buyer");
}

async function fetchSellerOrders(sellerId: string): Promise<SupplierOrder[]> {
  const [itemsRes, buyersRes] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        `
      id,
      quantity,
      line_total,
      product_id,
      product_snapshot,
      seller_id,
      buyed_id,
      orders (
        id,
        order_number,
        status,
        payment_status,
        created_at,
        estimated_delivery,
        shipping_address,
        tracking_number,
        delivery_partner
      )
    `,
      )
      .eq("seller_id", sellerId)
      .order("id", { ascending: false }),
    // Buyer contact details (name/business/phone/email) — buyers table is "read
    // own" only, so sellers can't join it directly; this SECURITY DEFINER RPC
    // scopes the result to buyers who actually ordered from this seller.
    supabase.rpc("get_seller_buyers"),
  ]);

  const { data, error } = itemsRes;
  if (error) throw error;

  const buyerMap = new Map<string, DbSellerBuyer>();
  if (!buyersRes.error) {
    for (const b of (buyersRes.data ?? []) as DbSellerBuyer[]) {
      buyerMap.set(String(b.buyer_id), b);
    }
  }

  const mapped = (data ?? []).map((row) => {
    const orderRaw = row.orders as unknown as Record<string, unknown> | Record<string, unknown>[] | null;
    const order = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
    const snap = (row.product_snapshot ?? {}) as Record<string, unknown>;
    const productName = String(snap.name ?? row.product_id ?? "Product");
    const paymentStatus = String(order?.payment_status ?? "pending");
    const buyerId = row.buyed_id ? String(row.buyed_id) : undefined;
    const buyerInfo = buyerId ? buyerMap.get(buyerId) : undefined;
    return {
      id: String(row.id),
      orderId: order?.id ? String(order.id) : undefined,
      orderNumber: String(order?.order_number ?? "—"),
      customer: buyerInfo?.name || customerFromAddress(order?.shipping_address),
      buyerId,
      buyerName: buyerInfo?.name || undefined,
      buyerBusiness: buyerInfo?.business || undefined,
      buyerPhone: buyerInfo?.phone || undefined,
      buyerEmail: buyerInfo?.email || undefined,
      product: productName,
      qty: Number(row.quantity ?? 0),
      amount: Number(row.line_total ?? 0),
      status: mapDbStatusToSupplier(String(order?.status ?? "pending")),
      createdAt: String(order?.created_at ?? new Date().toISOString()),
      expectedDelivery: order?.estimated_delivery ? String(order.estimated_delivery) : undefined,
      destination: destinationFromAddress(order?.shipping_address),
      paymentStatus: paymentStatus === "success" || paymentStatus === "paid" ? "paid" : "pending",
      gstRate: snap.gstRate != null ? Number(snap.gstRate) : (snap.gst_rate != null ? Number(snap.gst_rate) : 18),
      gstIncluded: snap.gstIncluded != null ? Boolean(snap.gstIncluded) : (snap.gst_included != null ? Boolean(snap.gst_included) : true),
      porterName: order?.delivery_partner ? String(order.delivery_partner) : undefined,
      vehicleDetails: order?.tracking_number ? `Track: ${String(order.tracking_number)}` : undefined,
    } satisfies SupplierOrder;
  });

  return mapped.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function useSupplierOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...SELLER_ORDERS_KEY, user?.id ?? "anon"],
    enabled: !!user?.id,
    staleTime: 20_000,
    queryFn: () => fetchSellerOrders(user!.id),
  });

  const updateStatus = async (
    id: string,
    status: SupplierOrder["status"],
    logisticsUpdate?: {
      porterName?: string;
      porterContact?: string;
      vehicleDetails?: string;
      pickupTime?: string;
      pickupAddress?: string;
    },
  ) => {
    if (!user?.id) throw new Error("Sign in as a seller to update orders");

    // id is order_items.id — resolve parent order
    const { data: line, error: lineErr } = await supabase
      .from("order_items")
      .select("order_id, seller_id")
      .eq("id", id)
      .eq("seller_id", user.id)
      .maybeSingle();
    if (lineErr) throw lineErr;
    if (!line?.order_id) throw new Error("Order line not found for this seller");

    const dbStatus = mapSupplierStatusToDb(status);
    const patch: Record<string, unknown> = { status: dbStatus };
    if (logisticsUpdate?.porterName) patch.delivery_partner = logisticsUpdate.porterName;
    if (logisticsUpdate?.vehicleDetails?.startsWith("Track:")) {
      patch.tracking_number = logisticsUpdate.vehicleDetails.replace(/^Track:\s*/, "");
    }

    const { error } = await supabase.from("orders").update(patch as never).eq("id", line.order_id);
    if (error) throw error;

    await queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_KEY });
  };

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateStatus,
  };
}

export type { SupplierOrder };

/* ---------- RFQs ---------- */
import { seedRfqs } from "@/data/supplierSeed";

const RFQ_KEY = "vs.supplier.rfqs.v1";

function readRfqs(): SupplierRFQ[] {
  if (typeof window === "undefined") return seedRfqs;
  try {
    const raw = window.localStorage.getItem(RFQ_KEY);
    if (!raw) return seedRfqs;
    return JSON.parse(raw);
  } catch {
    return seedRfqs;
  }
}

const rfqListeners = new Set<() => void>();
let rfqCache: SupplierRFQ[] | null = null;

function getRfqs() {
  if (!rfqCache) rfqCache = readRfqs();
  return rfqCache;
}

function writeRfqs(next: SupplierRFQ[]) {
  rfqCache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(RFQ_KEY, JSON.stringify(next));
  rfqListeners.forEach((l) => l());
}

export function useSupplierRfqs() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    rfqListeners.add(l);
    return () => {
      rfqListeners.delete(l);
    };
  }, []);
  return {
    rfqs: getRfqs(),
    updateStatus: (id: string, status: SupplierRFQ["status"], sellerResponse?: string, deliveryTimeline?: string) =>
      writeRfqs(
        getRfqs().map((r) =>
          r.id === id ? { ...r, status, sellerResponse: sellerResponse ?? r.sellerResponse, deliveryTimeline: deliveryTimeline ?? r.deliveryTimeline } : r
        )
      ),
  };
}
