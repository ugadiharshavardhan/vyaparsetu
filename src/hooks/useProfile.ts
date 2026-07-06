import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AuthRole } from "@/hooks/useAuth";

export type Profile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  gst_number: string | null;
  avatar_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
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
