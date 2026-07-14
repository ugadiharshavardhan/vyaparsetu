import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { useSessionMode } from "@/hooks/useSessionMode";

export type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";

/**
 * Unified account view for UI — sourced from buyers OR sellers (never profiles).
 */
export type Profile = {
  id: string;
  kind: "buyer" | "seller";
  full_name: string | null;
  owner_name: string | null;
  business_name: string | null;
  email: string | null;
  business_email: string | null;
  phone: string | null;
  alternate_phone: string | null;
  whatsapp: string | null;
  business_type: string | null;
  business_category: string | null;
  gst_number: string | null;
  pan_number: string | null;
  website: string | null;
  years_in_business: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  shop_image_url: string | null;
  gst_certificate_url: string | null;
  pan_document_url: string | null;
  verification_status: VerificationStatus;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type BuyerProfilePatch = {
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  full_name?: string | null;
  business_name?: string | null;
};

function mapBuyer(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    kind: "buyer",
    full_name: (row.full_name as string | null) ?? null,
    owner_name: (row.full_name as string | null) ?? null,
    business_name: (row.business_name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    business_email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    alternate_phone: null,
    whatsapp: (row.whatsapp as string | null) ?? null,
    business_type: "retailer",
    business_category: null,
    gst_number: null,
    pan_number: null,
    website: null,
    years_in_business: null,
    address: (row.address as string | null) ?? null,
    city: null,
    state: null,
    country: "India",
    pincode: null,
    avatar_url: null,
    logo_url: null,
    shop_image_url: null,
    gst_certificate_url: null,
    pan_document_url: null,
    verification_status: "verified",
    onboarding_completed: true,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function mapSeller(row: Record<string, unknown>): Profile {
  const status = String(row.verification_status ?? "pending") as VerificationStatus;
  return {
    id: String(row.id),
    kind: "seller",
    full_name: (row.full_name as string | null) ?? null,
    owner_name: (row.owner_name as string | null) ?? (row.full_name as string | null) ?? null,
    business_name: (row.business_name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    business_email: (row.business_email as string | null) ?? (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    alternate_phone: (row.alternate_phone as string | null) ?? null,
    whatsapp: (row.whatsapp as string | null) ?? null,
    business_type: (row.business_type as string | null) ?? "manufacturer",
    business_category: (row.business_category as string | null) ?? null,
    gst_number: (row.gst_number as string | null) ?? null,
    pan_number: (row.pan_number as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    years_in_business: typeof row.years_in_business === "number" ? row.years_in_business : null,
    address: (row.address as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    country: (row.country as string | null) ?? "India",
    pincode: (row.pincode as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    logo_url: (row.logo_url as string | null) ?? null,
    shop_image_url: (row.shop_image_url as string | null) ?? null,
    gst_certificate_url: (row.gst_certificate_url as string | null) ?? null,
    pan_document_url: (row.pan_document_url as string | null) ?? null,
    verification_status: ["pending", "under_review", "verified", "rejected"].includes(status)
      ? status
      : "pending",
    onboarding_completed: Boolean(row.onboarding_completed),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function useProfile() {
  const { user } = useAuth();
  const { data: account } = useAccountFlags();
  const sessionMode = useSessionMode();

  const preferSeller =
    sessionMode === "seller" || (!!account?.isSeller && !account?.isBuyer && sessionMode !== "buyer");

  return useQuery({
    queryKey: ["profile", user?.id, preferSeller ? "seller" : "buyer"],
    enabled: !!user?.id && !!account,
    queryFn: async (): Promise<Profile | null> => {
      const userId = user!.id;

      if (preferSeller && account?.isSeller) {
        const { data, error } = await supabase.from("sellers").select("*").eq("id", userId).maybeSingle();
        if (error) throw error;
        return data ? mapSeller(data as unknown as Record<string, unknown>) : null;
      }

      if (account?.isBuyer) {
        const { data, error } = await supabase.from("buyers").select("*").eq("id", userId).maybeSingle();
        if (error) throw error;
        return data ? mapBuyer(data as unknown as Record<string, unknown>) : null;
      }

      if (account?.isSeller) {
        const { data, error } = await supabase.from("sellers").select("*").eq("id", userId).maybeSingle();
        if (error) throw error;
        return data ? mapSeller(data as unknown as Record<string, unknown>) : null;
      }

      return null;
    },
  });
}

const SELLER_WRITABLE = [
  "full_name",
  "owner_name",
  "business_name",
  "phone",
  "whatsapp",
  "business_email",
  "website",
  "business_type",
  "business_category",
  "gst_number",
  "pan_number",
  "years_in_business",
  "address",
  "city",
  "state",
  "country",
  "pincode",
  "logo_url",
  "shop_image_url",
  "gst_certificate_url",
  "pan_document_url",
  "alternate_phone",
  "avatar_url",
  "verification_status",
  "onboarding_completed",
] as const;

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: account } = useAccountFlags();

  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user?.id) throw new Error("Not signed in");
      if (!account?.isSeller) throw new Error("Seller account required");

      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const key of SELLER_WRITABLE) {
        if (key in patch) payload[key] = patch[key as keyof Profile];
      }

      let { data, error } = await supabase
        .from("sellers")
        .update(payload as never)
        .eq("id", user.id)
        .select("*")
        .maybeSingle();

      // Pre-migration sellers table only has core columns
      if (error) {
        const core = {
          full_name: patch.full_name ?? patch.owner_name ?? null,
          business_name: patch.business_name ?? null,
          phone: patch.phone ?? null,
          gst_number: patch.gst_number ?? null,
          address: patch.address ?? null,
          updated_at: new Date().toISOString(),
        };
        ({ data, error } = await supabase
          .from("sellers")
          .update(core as never)
          .eq("id", user.id)
          .select("*")
          .maybeSingle());
      }
      if (error) throw error;
      return data ? mapSeller(data as unknown as Record<string, unknown>) : null;
    },
    onSuccess: (data) => {
      qc.setQueryData(["profile", user?.id], data);
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      qc.invalidateQueries({ queryKey: ["onboarding-complete", user?.id] });
    },
  });
}

/** Buyer contact/account update — buyers table only. */
export function useUpdateBuyerContact() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: BuyerProfilePatch) => {
      if (!user?.id) throw new Error("Not signed in");

      const buyerPatch: Record<string, string | null> = {};
      for (const key of ["phone", "whatsapp", "address", "full_name", "business_name"] as const) {
        if (key in patch) {
          const raw = patch[key];
          buyerPatch[key] = raw == null ? null : String(raw).trim() || null;
        }
      }
      if (Object.keys(buyerPatch).length === 0) {
        throw new Error("Nothing to update");
      }

      const { data, error } = await supabase
        .from("buyers")
        .update({ ...buyerPatch, updated_at: new Date().toISOString() } as never)
        .eq("id", user.id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? mapBuyer(data as unknown as Record<string, unknown>) : null;
    },
    onSuccess: (data) => {
      qc.setQueryData(["profile", user?.id], data);
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
