import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DELIVERY_LOCATIONS } from "@/lib/deliveryLocation";

export type MarketplacePublicStats = {
  verifiedSellers: number;
  buyers: number;
  products: number;
  brands: number;
  orders: number;
  cities: number;
};

async function fetchFromRpc(): Promise<Partial<MarketplacePublicStats> | null> {
  const { data, error } = await supabase.rpc("marketplace_public_stats");
  if (error || !data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  return {
    verifiedSellers: Number(row.verified_sellers ?? 0),
    buyers: Number(row.buyers ?? 0),
    products: Number(row.products ?? 0),
    brands: Number(row.brands ?? 0),
    orders: Number(row.orders ?? 0),
  };
}

/** Fallback when RPC is not applied — uses public products RLS only. */
async function fetchFromProducts(): Promise<Omit<MarketplacePublicStats, "cities">> {
  const { data, error, count } = await supabase
    .from("products")
    .select("seller_id, brand, supplier", { count: "exact" })
    .limit(2000);
  if (error) throw error;

  const sellerIds = new Set<string>();
  const brands = new Set<string>();
  for (const row of data ?? []) {
    const sid = (row as { seller_id?: string | null }).seller_id;
    if (sid) sellerIds.add(sid);
    const supplier = (row as { supplier?: { id?: string } | null }).supplier;
    if (supplier?.id) sellerIds.add(supplier.id);
    const brand = (row as { brand?: string | null }).brand?.trim();
    if (brand) brands.add(brand);
  }

  return {
    verifiedSellers: sellerIds.size,
    buyers: 0,
    products: count ?? data?.length ?? 0,
    brands: brands.size,
    orders: 0,
  };
}

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ["marketplace-public-stats"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<MarketplacePublicStats> => {
      const fromRpc = await fetchFromRpc();
      const base = fromRpc ?? (await fetchFromProducts());
      return {
        verifiedSellers: base.verifiedSellers ?? 0,
        buyers: base.buyers ?? 0,
        products: base.products ?? 0,
        brands: base.brands ?? 0,
        orders: base.orders ?? 0,
        cities: DELIVERY_LOCATIONS.length,
      };
    },
  });
}
