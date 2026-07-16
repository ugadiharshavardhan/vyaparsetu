import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type VerificationStatus = Database["public"]["Enums"]["verification_status"];

export type AdminSeller = {
  id: string;
  email: string | null;
  full_name: string | null;
  owner_name: string | null;
  business_name: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  business_type: string | null;
  business_category: string | null;
  logo_url: string | null;
  shop_image_url: string | null;
  gst_certificate_url: string | null;
  pan_document_url: string | null;
  verification_status: VerificationStatus;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminBuyer = {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const SELLERS_KEY = ["admin-sellers"] as const;
const BUYERS_KEY = ["admin-buyers"] as const;

const SELLER_COLUMNS = [
  "id",
  "email",
  "full_name",
  "owner_name",
  "business_name",
  "phone",
  "gst_number",
  "pan_number",
  "address",
  "city",
  "state",
  "pincode",
  "business_type",
  "business_category",
  "logo_url",
  "shop_image_url",
  "gst_certificate_url",
  "pan_document_url",
  "verification_status",
  "onboarding_completed",
  "created_at",
  "updated_at",
].join(",");

const BUYER_COLUMNS = [
  "id",
  "email",
  "full_name",
  "business_name",
  "phone",
  "whatsapp",
  "address",
  "created_at",
  "updated_at",
].join(",");

export function useAdminSellers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SELLERS_KEY,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    queryFn: async (): Promise<AdminSeller[]> => {
      const { data, error } = await supabase
        .from("sellers")
        .select(SELLER_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminSeller[];
    },
  });
}

export function useAdminBuyers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BUYERS_KEY,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    queryFn: async (): Promise<AdminBuyer[]> => {
      const { data, error } = await supabase
        .from("buyers")
        .select(BUYER_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminBuyer[];
    },
  });
}

export function useUpdateSellerVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: VerificationStatus }) => {
      const { data, error } = await supabase
        .from("sellers")
        .update({
          verification_status: input.status,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", input.id)
        .select("id, verification_status")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Could not update seller — check admin permissions");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SELLERS_KEY });
      void qc.invalidateQueries({ queryKey: ["catalog-products"] });
    },
  });
}

export function docsCount(seller: AdminSeller): number {
  return [
    seller.logo_url,
    seller.shop_image_url,
    seller.gst_certificate_url,
    seller.pan_document_url,
  ].filter(Boolean).length;
}
