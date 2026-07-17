import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL || env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const names = [
  "Aashirvaad Atta, 10 Kg",
  "A4 Refined Rice Bran Oil, 15 L Tin Bulk",
  "Everest Garam Masala, 500 Gm",
  "Catch Turmeric Powder, 1 Kg",
  "Tata Salt",
  "Daawat Rozana Platinum Basmati Rice",
];

const { data } = await sb
  .from("products")
  .select("name, brand, wholesale_price, mrp, description, highlights, unit")
  .or(names.map((n) => `name.eq.${n}`).join(","));

// fallback ilike search
const { data: all } = await sb
  .from("products")
  .select("name, brand, wholesale_price, mrp, description, unit")
  .or(
    "name.ilike.%Aashirvaad Atta%,name.ilike.%A4 Refined%,name.ilike.%Everest Garam Masala%,name.ilike.%Catch Turmeric%,name.ilike.%Tata Salt%,name.ilike.%Daawat Rozana Platinum%,name.ilike.%Madhur%",
  )
  .limit(20);

for (const p of all ?? []) {
  console.log("\n" + p.name);
  console.log(`  ${p.brand} | W ₹${p.wholesale_price} | MRP ₹${p.mrp} | unit ${p.unit}`);
  console.log(`  desc (${(p.description || "").length} chars): ${(p.description || "").slice(0, 160)}…`);
}

const { data: stats } = await sb.from("products").select("wholesale_price, mrp, description");
const prices = (stats ?? []).map((p) => Number(p.wholesale_price));
const descs = (stats ?? []).map((p) => (p.description || "").length);
console.log("\n--- catalog stats ---");
console.log("count", prices.length);
console.log("wholesale min/avg/max", Math.min(...prices), Math.round(prices.reduce((a, b) => a + b, 0) / prices.length), Math.max(...prices));
console.log("desc len min/avg/max", Math.min(...descs), Math.round(descs.reduce((a, b) => a + b, 0) / descs.length), Math.max(...descs));
console.log("still 99?", prices.filter((p) => p === 99).length);
