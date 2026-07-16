import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
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
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: cats, error } = await sb
  .from("categories")
  .select("slug, name, image")
  .order("name");
if (error) throw error;

for (const c of cats) {
  console.log(`\n${c.slug} | ${c.name}`);
  console.log(`  ${c.image || "(none)"}`);
}

// Sample product images for spices (to find a clean cover)
const { data: spices } = await sb
  .from("products")
  .select("name, image, images")
  .eq("category_slug", "spices")
  .limit(15);

console.log("\n--- spices product images (sample) ---");
for (const p of spices ?? []) {
  console.log(`- ${p.name}: ${p.image || "(no primary)"}`);
}
