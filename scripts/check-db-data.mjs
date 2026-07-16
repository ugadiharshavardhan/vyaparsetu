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
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  "profiles",
  "sellers",
  "buyers",
  "admins",
  "products",
  "seller_products",
  "categories",
  "orders",
  "order_items",
  "cart_items",
  "wishlist_items",
  "shipping_addresses",
  "payment_records",
  "invoices",
  "coupons",
];

async function countTable(name) {
  const { count, error } = await sb.from(name).select("*", { count: "exact", head: true });
  if (error) {
    return { table: name, count: null, error: error.message };
  }
  return { table: name, count: count ?? 0, error: null };
}

async function authUserCount() {
  let total = 0;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return { count: null, error: error.message };
    total += data.users.length;
    if (data.users.length < 200) break;
  }
  return { count: total, error: null };
}

console.log("Supabase project:", env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || "(from url)");
console.log("---\n");

const results = [];
for (const t of tables) {
  results.push(await countTable(t));
}

const auth = await authUserCount();

const maxLen = Math.max(...results.map((r) => r.table.length), "auth.users".length);

console.log("Table".padEnd(maxLen + 2) + "Rows    Status");
console.log("-".repeat(maxLen + 30));

for (const r of results) {
  const status = r.error ? `ERROR: ${r.error}` : r.count === 0 ? "empty" : "has data";
  const countStr = r.error ? "—" : String(r.count);
  console.log(`${r.table.padEnd(maxLen + 2)}${countStr.padEnd(8)}${status}`);
}

const authStatus = auth.error ? `ERROR: ${auth.error}` : auth.count === 0 ? "empty" : "has data";
console.log(`${"auth.users".padEnd(maxLen + 2)}${auth.error ? "—" : String(auth.count).padEnd(8)}${authStatus}`);

const withData = results.filter((r) => !r.error && (r.count ?? 0) > 0);
const empty = results.filter((r) => !r.error && r.count === 0);
const missing = results.filter((r) => r.error);

console.log("\n--- Summary ---");
console.log(`Tables with data: ${withData.length}`);
console.log(`Empty tables: ${empty.length}`);
console.log(`Missing / inaccessible: ${missing.length}`);
if (withData.length) {
  console.log("\nTables that HAVE data:");
  for (const r of withData) console.log(`  - ${r.table}: ${r.count} rows`);
}
if (missing.length) {
  console.log("\nTables not found or not accessible:");
  for (const r of missing) console.log(`  - ${r.table}: ${r.error}`);
}
