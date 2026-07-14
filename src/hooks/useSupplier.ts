import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  seedCustomers,
  seedMovements,
  seedNotifications,
  seedPromotions,
  seedReviews,
  seedWarehouses,
} from "@/data/supplierSeed";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useCatalog";
import {
  mapCatalogProductToSupplier,
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
} from "@/types/supplier";

const KEY = "vs.supplier.v1";
const PRODUCTS_KEY = ["catalog-products"] as const;

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

/* ---------- Products (catalog from Supabase) ---------- */
export function useSupplierProducts() {
  const query = useProducts();
  const queryClient = useQueryClient();
  const products = useMemo(
    () => (query.data ?? []).map(mapCatalogProductToSupplier),
    [query.data],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });

  return {
    products,
    isLoading: query.isLoading,
    error: query.error,
    create: async (p: Omit<SupplierProduct, "id" | "createdAt" | "updatedAt">) => {
      const id = uid("p");
      const row = supplierDraftToInsert(p, id);
      const { error } = await supabase.from("products").insert(row);
      if (error) throw error;
      await invalidate();
      return id;
    },
    updateProduct: async (id: string, patch: Partial<SupplierProduct>) => {
      const update = supplierPatchToUpdate(patch);
      if (Object.keys(update).length === 0) return;
      const { error } = await supabase.from("products").update(update).eq("id", id);
      if (error) throw error;
      await invalidate();
    },
    remove: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await invalidate();
    },
    duplicate: async (id: string) => {
      const original = products.find((p) => p.id === id);
      if (!original) return;
      const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = original;
      void _id;
      void _c;
      void _u;
      await createLike(draft);
      async function createLike(d: Omit<SupplierProduct, "id" | "createdAt" | "updatedAt">) {
        const newId = uid("p");
        const row = supplierDraftToInsert(
          {
            ...d,
            name: `${d.name} (Copy)`,
            sku: `${d.sku}-COPY`,
            status: "draft",
          },
          newId,
        );
        const { error } = await supabase.from("products").insert(row);
        if (error) throw error;
        await invalidate();
      }
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
  const queryClient = useQueryClient();
  return {
    movements: store.movements,
    adjust: async (product: SupplierProduct, qty: number, note: string, type: StockMovement["type"] = "adjustment") => {
      const nextStock = Math.max(0, product.stock + qty);
      const { error } = await supabase
        .from("products")
        .update({ stock_count: nextStock, in_stock: nextStock > 0 })
        .eq("id", product.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      update((s) => ({
        ...s,
        movements: [
          {
            id: uid("m"),
            productId: product.id,
            productName: product.name,
            type,
            qty,
            note,
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
  const [store, update] = useStore();
  return {
    reviews: store.reviews,
    reply: (id: string, text: string) =>
      update((s) => ({
        ...s,
        reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply: text } : r)),
      })),
  };
}

/* ---------- Customers ---------- */
export function useSupplierCustomers() {
  const [store] = useStore();
  return { customers: store.customers };
}

/* ---------- Supplier orders (mock derived from customer data) ---------- */
export type SupplierOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  qty: number;
  amount: number;
  status: "pending" | "accepted" | "packed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  destination: string;
  paymentStatus: "paid" | "pending";
};

const seedOrders = (): SupplierOrder[] => {
  const now = Date.now();
  return [
    { id: "so1", orderNumber: "VS-1044", customer: "Sharma Kirana Store", product: "Aashirvaad Atta 10kg", qty: 12, amount: 4620, status: "pending", createdAt: new Date(now).toISOString(), destination: "Mumbai, MH", paymentStatus: "paid" },
    { id: "so2", orderNumber: "VS-1043", customer: "Meena Wholesale", product: "Parle-G 800g", qty: 30, amount: 3300, status: "accepted", createdAt: new Date(now - 3600_000 * 4).toISOString(), destination: "Pune, MH", paymentStatus: "paid" },
    { id: "so3", orderNumber: "VS-1042", customer: "Sharma Kirana Store", product: "Aashirvaad Atta 10kg", qty: 8, amount: 3080, status: "packed", createdAt: new Date(now - 86400_000).toISOString(), destination: "Mumbai, MH", paymentStatus: "paid" },
    { id: "so4", orderNumber: "VS-1041", customer: "Suresh & Sons", product: "Tata Salt 1kg", qty: 48, amount: 1056, status: "shipped", createdAt: new Date(now - 86400_000 * 2).toISOString(), destination: "Ahmedabad, GJ", paymentStatus: "paid" },
    { id: "so5", orderNumber: "VS-1040", customer: "New Bazaar Retail", product: "Britannia Marie Gold", qty: 30, amount: 1650, status: "delivered", createdAt: new Date(now - 86400_000 * 3).toISOString(), destination: "Delhi, DL", paymentStatus: "paid" },
    { id: "so6", orderNumber: "VS-1039", customer: "Kalyan Distribution", product: "Aashirvaad Atta 10kg", qty: 20, amount: 7700, status: "delivered", createdAt: new Date(now - 86400_000 * 4).toISOString(), destination: "Chennai, TN", paymentStatus: "paid" },
    { id: "so7", orderNumber: "VS-1038", customer: "Meena Wholesale", product: "Parle-G 800g", qty: 15, amount: 1650, status: "cancelled", createdAt: new Date(now - 86400_000 * 5).toISOString(), destination: "Pune, MH", paymentStatus: "pending" },
  ];
};

const ORDER_KEY = "vs.supplier.orders.v1";

function readOrders(): SupplierOrder[] {
  if (typeof window === "undefined") return seedOrders();
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return seedOrders();
    return JSON.parse(raw);
  } catch {
    return seedOrders();
  }
}

const orderListeners = new Set<() => void>();
let orderCache: SupplierOrder[] | null = null;

function getOrders() {
  if (!orderCache) orderCache = readOrders();
  return orderCache;
}

function writeOrders(next: SupplierOrder[]) {
  orderCache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(ORDER_KEY, JSON.stringify(next));
  orderListeners.forEach((l) => l());
}

export function useSupplierOrders() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    orderListeners.add(l);
    return () => {
      orderListeners.delete(l);
    };
  }, []);
  return {
    orders: getOrders(),
    updateStatus: (id: string, status: SupplierOrder["status"]) =>
      writeOrders(getOrders().map((o) => (o.id === id ? { ...o, status } : o))),
  };
}
