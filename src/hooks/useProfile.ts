import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AuthRole } from "@/hooks/useAuth";

export type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";

export type Profile = {
  id: string;
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

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });
}

export function useRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AuthRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AuthRole);
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user?.id) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch as never)
        .eq("id", user.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    onSuccess: (data) => {
      qc.setQueryData(["profile", user?.id], data);
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
