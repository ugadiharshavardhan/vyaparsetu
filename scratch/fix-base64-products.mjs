import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const raw = readFileSync(".env", "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[line.slice(0, i).trim()] = v;
}

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "product-images";

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function parseDataUri(uri) {
  const m = /^data:([^;,]+)?(?:;base64)?,(.*)$/s.exec(uri);
  if (!m) return null;
  const mime = (m[1] || "image/jpeg").toLowerCase();
  return { mime, ext: EXT_BY_MIME[mime] || "jpg", buffer: Buffer.from(m[2], "base64") };
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if ((buckets ?? []).some((b) => b.name === BUCKET)) return;
  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: Object.keys(EXT_BY_MIME),
  });
}

async function uploadDataUri(id, idx, uri) {
  const parsed = parseDataUri(uri);
  if (!parsed) return uri; // leave non-data URIs untouched
  const path = `seller-uploads/${id}-${idx}.${parsed.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, parsed.buffer, { contentType: parsed.mime, upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

await ensureBucket();

const { data: rows, error } = await supabase
  .from("products")
  .select("id, name, image, images")
  .like("image", "data:image%");
if (error) throw error;

console.log(`Fixing ${rows?.length ?? 0} products with base64 images…`);

let fixed = 0;
for (const p of rows ?? []) {
  const imgs = Array.isArray(p.images) ? p.images.map(String) : [];
  const newImages = [];
  for (let i = 0; i < imgs.length; i++) {
    const u = imgs[i];
    newImages.push(u.startsWith("data:") ? await uploadDataUri(p.id, i, u) : u);
  }
  let newCover = p.image;
  if (typeof newCover === "string" && newCover.startsWith("data:")) {
    // Reuse the first uploaded image if the cover matches images[0]; else upload cover separately.
    newCover = newImages.find((u) => !u.startsWith("data:")) || (await uploadDataUri(p.id, "cover", p.image));
  }
  if (!newImages.length && newCover) newImages.push(newCover);

  const { error: upErr } = await supabase
    .from("products")
    .update({ image: newCover, images: newImages, updated_at: new Date().toISOString() })
    .eq("id", p.id);
  if (upErr) {
    console.error(`  ! ${p.id} update failed: ${upErr.message}`);
    continue;
  }
  fixed++;
  console.log(`  ✓ ${p.id} (${p.name}) -> ${newCover.slice(0, 80)}`);
}

console.log(`Done. Fixed ${fixed}/${rows?.length ?? 0}.`);
