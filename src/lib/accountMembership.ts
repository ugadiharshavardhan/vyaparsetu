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

/**
 * Validate (and, for customers, self-heal) role membership at sign-in time.
 *
 * - Seller tab  → the user MUST already exist in `public.sellers` (sellers are
 *   created through signup + verification; we never silently create one here).
 * - Customer tab → the user must exist in `public.buyers`. If neither a buyer
 *   nor seller row exists yet (e.g. a signup upsert failed), we heal the buyer
 *   row from auth metadata so a genuine customer is never locked out.
 *
 * A user who belongs to the *other* role is rejected with a message pointing
 * them at the correct tab, so seller and buyer logins stay separated.
 */
export async function ensureRoleMembershipForSignIn(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null },
  wanted: "buyer" | "seller",
): Promise<{ ok: true } | { ok: false; message: string }> {
  const [buyerRow, sellerRow] = await Promise.all([
    supabase.from("buyers").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("sellers").select("id").eq("id", user.id).maybeSingle(),
  ]);
  const hasBuyer = !!buyerRow.data;
  const hasSeller = !!sellerRow.data;

  if (wanted === "seller") {
    if (hasSeller) return { ok: true };
    if (hasBuyer) {
      return {
        ok: false,
        message: "This email is registered as a customer. Please use the Customer tab to sign in.",
      };
    }
    return {
      ok: false,
      message: "No seller account found for this email. Create a seller account to continue.",
    };
  }

  // wanted === "buyer"
  if (hasBuyer) return { ok: true };
  if (hasSeller) {
    return {
      ok: false,
      message: "This email is registered as a seller. Please use the Seller tab to sign in.",
    };
  }

  // Neither row exists — heal a customer account from auth metadata.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = (user.email ?? "").toLowerCase();
  const fullName =
    String(meta.full_name ?? meta.owner_name ?? "").trim() || email.split("@")[0] || "Customer";
  const { error } = await supabase.from("buyers").upsert(
    {
      id: user.id,
      email,
      full_name: fullName,
      business_name: String(meta.business_name ?? fullName),
      phone: String(meta.phone ?? ""),
      whatsapp: String(meta.whatsapp ?? meta.phone ?? ""),
      address: String(meta.address ?? ""),
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "id" },
  );
  if (error) {
    return { ok: false, message: "No customer account found for this email." };
  }
  await removeLegacyProfileRow(user.id);
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
