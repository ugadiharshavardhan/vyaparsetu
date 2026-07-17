/**
 * Replace bad spices category cover (Tikhalal+Tata Salt collage / marketing card)
 * with Everest Coriander Powder pack front + cache-busted categories.image URL.
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

const localFile = resolve("scratch/category-covers/everest-4.png");
const buf = readFileSync(localFile);
const objectPath = "categories/spices.png";

const { error: upErr } = await sb.storage.from("category-images").upload(objectPath, buf, {
  contentType: "image/png",
  upsert: true,
});
if (upErr) throw upErr;

const { data: pub } = sb.storage.from("category-images").getPublicUrl(objectPath);
const bust = `${pub.publicUrl}?v=${Date.now()}`;

const { error: updErr } = await sb
  .from("categories")
  .update({ image: bust })
  .eq("slug", "spices");
if (updErr) throw updErr;

// Refresh cache-busters on recently re-uploaded covers too
for (const slug of ["pulses-dal", "salt-sugar"]) {
  const path = `categories/${slug}.png`;
  const { data } = sb.storage.from("category-images").getPublicUrl(path);
  const { error } = await sb
    .from("categories")
    .update({ image: `${data.publicUrl}?v=${Date.now()}` })
    .eq("slug", slug);
  if (error) console.error(`cache-bust ${slug}:`, error.message);
  else console.log(`cache-bust OK ${slug}`);
}

console.log(`spices → ${bust}`);
