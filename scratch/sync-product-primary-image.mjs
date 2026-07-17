/**
 * Sync products.image to products.images[0] so banner matches the image queue.
 */
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
const sb = createClient(
  env.SUPABASE_URL || env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await sb.from("products").select("id, image, images");
if (error) throw error;

let updated = 0;
let skipped = 0;
for (const row of data ?? []) {
  const images = Array.isArray(row.images)
    ? row.images.map(String).filter(Boolean)
    : [];
  if (!images.length) {
    skipped += 1;
    continue;
  }
  const primary = images[0];
  if (row.image === primary) {
    skipped += 1;
    continue;
  }
  const { error: updErr } = await sb
    .from("products")
    .update({ image: primary })
    .eq("id", row.id);
  if (updErr) {
    console.error(row.id, updErr.message);
    continue;
  }
  updated += 1;
}

console.log(`Synced image ← images[0]. Updated: ${updated}, Unchanged/skipped: ${skipped}`);
