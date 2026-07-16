/**
 * Assign all catalog products to a seller by email.
 * Works with or without seller_id / seller_products migration applied.
 * Usage: node scripts/backfill-seller-products.mjs [email]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SELLER_EMAIL = (process.argv[2] ?? "ugadiharshavardhan@gmail.com").trim().toLowerCase();

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function resolveSeller() {
  const { data: sellerRow, error } = await supabase
    .from("sellers")
    .select("id, email, business_name, full_name")
    .ilike("email", SELLER_EMAIL)
    .maybeSingle();
  if (error) throw error;
  if (sellerRow?.id) return sellerRow;

  let page = 1;
  while (page <= 20) {
    const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (usersErr) throw usersErr;
    const match = usersData.users.find((u) => u.email?.toLowerCase() === SELLER_EMAIL);
    if (match) {
      const row = {
        id: match.id,
        email: match.email,
        full_name: match.user_metadata?.full_name ?? match.user_metadata?.fullName ?? "Seller",
        business_name: match.user_metadata?.business_name ?? match.user_metadata?.businessName ?? "Business",
      };
      const { error: upsertErr } = await supabase.from("sellers").upsert(row, { onConflict: "id" });
      if (upsertErr) throw upsertErr;
      return row;
    }
    if (usersData.users.length < 200) break;
    page += 1;
  }
  throw new Error(`No seller/auth user found for ${SELLER_EMAIL}`);
}

async function main() {
  console.log(`Backfilling catalog for seller: ${SELLER_EMAIL}`);
  const seller = await resolveSeller();
  console.log(`Seller id: ${seller.id}`);

  const { data: products, error: productsErr } = await supabase.from("products").select("id, name, supplier");
  if (productsErr) throw productsErr;
  const list = products ?? [];
  console.log(`Found ${list.length} products in catalog`);
  if (!list.length) return;

  const supplierMeta = {
    id: seller.id,
    name: seller.business_name || seller.full_name || "Seller",
    location: "",
    verified: true,
    rating: 4.5,
    yearsActive: 1,
  };

  let updated = 0;
  for (const p of list) {
    const patch = { supplier: supplierMeta };
    const { error } = await supabase.from("products").update(patch).eq("id", p.id);
    if (error) throw error;
    updated += 1;
  }
  console.log(`Updated supplier JSON on ${updated} products`);

  const probe = await supabase.from("products").update({ seller_id: seller.id }).eq("id", list[0].id);
  if (!probe.error) {
    const { error: allSellerErr } = await supabase
      .from("products")
      .update({ seller_id: seller.id, supplier: supplierMeta })
      .not("id", "is", null);
    if (allSellerErr) throw allSellerErr;
    console.log("Set products.seller_id for all products");

    const links = list.map((p) => ({
      id: p.id,
      seller_id: seller.id,
      product_id: p.id,
      updated_at: new Date().toISOString(),
    }));
    const { error: linkErr } = await supabase.from("seller_products").upsert(links, { onConflict: "product_id" });
    if (!linkErr) {
      console.log(`Linked ${links.length} rows in seller_products`);
    } else if (!linkErr.message.includes("seller_products")) {
      throw linkErr;
    }
  } else {
    console.log("products.seller_id not migrated yet — using supplier.id only (run SQL migration when possible)");
  }

  const { count, error: verifyErr } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .filter("supplier->>id", "eq", seller.id);
  if (verifyErr) throw verifyErr;
  console.log(`Verified ${count ?? 0} products tagged with supplier.id = ${seller.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
