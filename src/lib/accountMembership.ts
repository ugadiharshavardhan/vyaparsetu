import { supabase } from "@/integrations/supabase/client";

/** Verify the auth user exists in the buyers or sellers table for the chosen sign-in role. */
export async function assertAccountMembership(
  userId: string,
  role: "buyer" | "seller",
): Promise<{ ok: true } | { ok: false; message: string }> {
  const table = role === "seller" ? "sellers" : "buyers";
  const { data, error } = await supabase.from(table).select("id").eq("id", userId).maybeSingle();
  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return {
      ok: false,
      message:
        role === "seller"
          ? "No seller account found for this email. Sign in as Customer, or create a seller account."
          : "No customer account found for this email. Sign in as Seller, or create a customer account.",
    };
  }
  return { ok: true };
}
