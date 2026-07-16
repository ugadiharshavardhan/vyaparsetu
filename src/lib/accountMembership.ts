import { supabase } from "@/integrations/supabase/client";

/** Best-effort delete of legacy public.profiles row (table removed after migration). */
export async function removeLegacyProfileRow(userId: string) {
  await supabase.from("profiles").delete().eq("id", userId);
}

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

/** Ensure buyer signup lands in public.buyers (does not write profiles). */
export async function ensureBuyerAccount(row: {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  phone: string;
  whatsapp: string;
  address: string;
}) {
  const { error } = await supabase.from("buyers").upsert(
    {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      business_name: row.business_name,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "id" },
  );
  if (error) throw error;
  await removeLegacyProfileRow(row.id);
}

/** Ensure seller signup lands in public.sellers (does not write profiles). */
export async function ensureSellerAccount(row: {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  phone: string;
  gst_number?: string;
  address?: string;
}) {
  const payload: Record<string, unknown> = {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    owner_name: row.full_name,
    business_name: row.business_name,
    phone: row.phone,
    gst_number: row.gst_number || null,
    address: row.address || null,
    business_type: "manufacturer",
    onboarding_completed: false,
    verification_status: "pending",
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("sellers").upsert(payload as never, { onConflict: "id" });
  if (error) {
    // Fallback if seller profile columns are not migrated yet
    ({ error } = await supabase.from("sellers").upsert(
      {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        business_name: row.business_name,
        phone: row.phone,
        gst_number: row.gst_number || null,
        address: row.address || null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "id" },
    ));
  }
  if (error) throw error;
  await removeLegacyProfileRow(row.id);
}
