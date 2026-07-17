/**
 * Dump products for enrichment planning.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const sb = createClient(
  env.SUPABASE_URL || env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await sb
  .from("products")
  .select(
    "id, name, brand, category_slug, unit, moq, wholesale_price, mrp, description, packaging_details, gst_rate",
  )
  .order("category_slug")
  .order("name");
if (error) throw error;

console.log(`Total products: ${data.length}`);
const byCat = {};
for (const p of data) {
  byCat[p.category_slug] = (byCat[p.category_slug] || 0) + 1;
}
console.log("By category:", byCat);

const sample = data.slice(0, 25).map((p) => ({
  name: p.name,
  brand: p.brand,
  cat: p.category_slug,
  unit: p.unit,
  wholesale: p.wholesale_price,
  mrp: p.mrp,
  descLen: (p.description || "").length,
  desc: (p.description || "").slice(0, 80),
}));
console.log(JSON.stringify(sample, null, 2));

writeFileSync(
  resolve("scratch/products-for-enrichment.json"),
  JSON.stringify(data, null, 2),
);
console.log("Wrote scratch/products-for-enrichment.json");
