import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ShippingAddress } from "@/types/commerce";
import { toast } from "sonner";

const KEY = ["addresses"] as const;

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
      return (data ?? []) as unknown as ShippingAddress[];
    },
  });
}

export type AddressInput = Omit<ShippingAddress, "id" | "user_id">;

export function useSaveAddress() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: AddressInput }) => {
      if (!user) throw new Error("Please sign in");
      if (values.is_default) {
        await supabase.from("shipping_addresses").update({ is_default: false }).eq("user_id", user.id);
      }
      if (id) {
        const { error } = await supabase.from("shipping_addresses").update(values).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shipping_addresses")
          .insert({ ...values, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
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
      const { error } = await supabase.from("shipping_addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
