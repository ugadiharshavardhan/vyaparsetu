import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ShippingAddress } from "@/types/commerce";
import { toast } from "sonner";

const KEY = ["addresses"] as const;

export type BuyerShippingAddressPayload = {
  label: string | null;
  type: ShippingAddress["type"];
  contact_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gst_number: string | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
};

function toBuyerPayload(values: AddressInput): BuyerShippingAddressPayload {
  return {
    label: values.label ?? null,
    type: values.type,
    contact_name: values.contact_name,
    phone: values.phone,
    line1: values.line1,
    line2: values.line2 ?? null,
    landmark: values.landmark ?? null,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    country: values.country || "India",
    gst_number: values.gst_number ?? null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    updated_at: new Date().toISOString(),
  };
}

async function syncBuyerShippingAddress(userId: string, payload: BuyerShippingAddressPayload) {
  const { error } = await supabase
    .from("buyers")
    .update({ shipping_address: payload as never, updated_at: payload.updated_at })
    .eq("id", userId);

  if (!error) return;

  // Fallback until shipping_address column is migrated: keep a readable address string.
  const line = [payload.line1, payload.line2, payload.city, payload.state, payload.pincode]
    .filter(Boolean)
    .join(", ");
  const { error: fallbackError } = await supabase
    .from("buyers")
    .update({ address: line || null, updated_at: payload.updated_at })
    .eq("id", userId);
  if (fallbackError) throw error;
}

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async (): Promise<ShippingAddress[]> => {
      const { data, error } = await supabase
        .from("shipping_addresses")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          ...(row as unknown as ShippingAddress),
          latitude: typeof r.latitude === "number" ? r.latitude : null,
          longitude: typeof r.longitude === "number" ? r.longitude : null,
        };
      });
    },
  });
}

export type AddressInput = Omit<ShippingAddress, "id" | "user_id">;

async function saveShippingRow(userId: string, id: string | undefined, values: AddressInput) {
  const base = {
    label: values.label ?? null,
    type: values.type,
    contact_name: values.contact_name,
    phone: values.phone,
    line1: values.line1,
    line2: values.line2 ?? null,
    landmark: values.landmark ?? null,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    country: values.country || "India",
    gst_number: values.gst_number ?? null,
    is_default: values.is_default,
  };

  const withCoords = {
    ...base,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
  };

  if (values.is_default) {
    await supabase.from("shipping_addresses").update({ is_default: false }).eq("user_id", userId);
  }

  if (id) {
    let { error } = await supabase.from("shipping_addresses").update(withCoords as never).eq("id", id);
    if (error) {
      ({ error } = await supabase.from("shipping_addresses").update(base as never).eq("id", id));
    }
    if (error) throw error;
    return id;
  }

  let { data, error } = await supabase
    .from("shipping_addresses")
    .insert({ ...withCoords, user_id: userId } as never)
    .select("id")
    .single();
  if (error) {
    ({ data, error } = await supabase
      .from("shipping_addresses")
      .insert({ ...base, user_id: userId } as never)
      .select("id")
      .single());
  }
  if (error) throw error;
  if (!data?.id) throw new Error("Could not save address");
  return String(data.id);
}

export function useSaveAddress() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: AddressInput }) => {
      if (!user) throw new Error("Please sign in");
      const savedId = await saveShippingRow(user.id, id, values);

      // Main: persist structured shipping address on the buyer row.
      // Prefer when default (or first/only) so checkout profile stays in sync.
      if (values.is_default) {
        await syncBuyerShippingAddress(user.id, toBuyerPayload(values));
      } else {
        const { count } = await supabase
          .from("shipping_addresses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if ((count ?? 0) <= 1) {
          await syncBuyerShippingAddress(user.id, toBuyerPayload(values));
        }
      }

      return savedId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Address saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shipping_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Address removed");
    },
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase.from("shipping_addresses").update({ is_default: false }).eq("user_id", user.id);
      const { data, error } = await supabase
        .from("shipping_addresses")
        .update({ is_default: true })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      const row = data as unknown as ShippingAddress;
      await syncBuyerShippingAddress(user.id, toBuyerPayload({
        ...row,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
      }));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Default address updated");
    },
  });
}
