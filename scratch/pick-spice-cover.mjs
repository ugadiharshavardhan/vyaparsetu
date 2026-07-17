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

const env = loadEnv();
const sb = createClient(
  env.SUPABASE_URL || env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await sb
  .from("products")
  .select("name, image, images")
  .eq("category_slug", "spices")
  .ilike("name", "%everest%");
if (error) throw error;

const outDir = resolve("scratch/category-covers");
let i = 0;
for (const p of data ?? []) {
  const urls = [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean);
  console.log("\n" + p.name);
  for (const u of urls.slice(0, 4)) {
    console.log(" ", u);
    try {
      const res = await fetch(u);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = u.includes(".webp") ? ".webp" : u.includes(".jpg") ? ".jpg" : ".png";
      const file = resolve(outDir, `everest-${i++}${ext}`);
      writeFileSync(file, buf);
      console.log("  ->", file, buf.length);
    } catch (e) {
      console.log("  fail", e.message);
    }
  }
}
