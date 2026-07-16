import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const raw = readFileSync(".env", "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let v = line.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[line.slice(0, i).trim()] = v;
}

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(url, key);

const cols =
  "id,slug,name,brand,category_slug,seller_id,wholesale_price,in_stock,stock_count";

const plain = await supabase.from("products").select(cols).limit(5);
console.log("plain count/error:", plain.data?.length, plain.error?.message);

const joined = await supabase
  .from("products")
  .select(`${cols}, sellers!inner(verification_status)`)
  .eq("sellers.verification_status", "verified")
  .limit(5);
console.log("joined count/error:", joined.data?.length, joined.error?.message, joined.error);

const joined2 = await supabase
  .from("products")
  .select(`${cols}, sellers!products_seller_id_fkey!inner(verification_status)`)
  .eq("sellers.verification_status", "verified")
  .limit(5);
console.log("joined2 count/error:", joined2.data?.length, joined2.error?.message);

const count = await supabase
  .from("products")
  .select("id", { count: "exact", head: true });
console.log("total visible via anon:", count.count, count.error?.message);
