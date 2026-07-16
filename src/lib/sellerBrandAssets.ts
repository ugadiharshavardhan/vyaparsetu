import { supabase } from "@/integrations/supabase/client";

async function uploadBrandFile(userId: string, label: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${userId}/${label}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("business-documents").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = await supabase.storage
    .from("business-documents")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? path;
}

/** After signup session exists — attach logo/shop images and submit for admin review. */
export async function attachSellerBrandAssets(input: {
  userId: string;
  logo?: File | null;
  shopImage?: File | null;
}) {
  const patch: Record<string, string | boolean> = {
    verification_status: "under_review",
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  if (input.logo) {
    patch.logo_url = await uploadBrandFile(input.userId, "business-logo", input.logo);
  }
  if (input.shopImage) {
    patch.shop_image_url = await uploadBrandFile(input.userId, "shop-image", input.shopImage);
  }

  const { error } = await supabase
    .from("sellers")
    .update(patch as never)
    .eq("id", input.userId);
  if (error) throw error;
}
