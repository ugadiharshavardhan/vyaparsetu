import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
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
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

console.log("URL:", env.SUPABASE_URL);
console.log("PROJECT:", env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID);

const { data: coupons, error: cErr } = await sb.from("coupons").select("id, code, created_at").order("created_at", { ascending: true });
console.log("coupons:", cErr?.message || coupons);

// Check if seller_id column exists now (migration applied?)
const { error: sellerColErr } = await sb.from("products").select("seller_id").limit(1);
console.log("products.seller_id column:", sellerColErr ? sellerColErr.message : "exists");

const { error: spErr } = await sb.from("seller_products").select("id").limit(1);
console.log("seller_products table:", spErr ? spErr.message : "exists");

const { error: pErr } = await sb.from("profiles").select("id").limit(1);
console.log("profiles table:", pErr ? pErr.message : "exists (empty ok)");
