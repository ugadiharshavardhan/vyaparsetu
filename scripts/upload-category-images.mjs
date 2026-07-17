/**
 * Upload main category cover images to Supabase Storage and set
 * `categories.image` to the public URL.
 *
 * Match files/folders by category **name** or **slug** (case / spacing /
 * punctuation insensitive).
 *
 * Supported layouts under `--dir` (default: `./category-images`):
 *
 *   1) Flat file named after category:
 *        Spices.jpg
 *        Food Grains & Cereals.png
 *        pulses-dal.webp
 *        Pulses (Dal).jpg
 *
 *   2) Folder named after category (first image inside):
 *        Spices/cover.jpg
 *        personal-care/1.png
 *
 * Usage:
 *   node scripts/upload-category-images.mjs --dry-run
 *   node scripts/upload-category-images.mjs
 *   node scripts/upload-category-images.mjs --dir ./category-images
 *   node scripts/upload-category-images.mjs --bucket category-images
 *
 * Requires .env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const DEFAULT_BUCKET = "category-images";
const DEFAULT_DIR = resolve(process.cwd(), "category-images");

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf8");
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

function parseArgs(argv) {
  const out = {
    dir: DEFAULT_DIR,
    bucket: DEFAULT_BUCKET,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" && argv[i + 1]) out.dir = resolve(argv[++i]);
    else if (a === "--bucket" && argv[i + 1]) out.bucket = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

/** Normalize name/slug for matching: "Food Grains & Cereals" → "food-grains-and-cereals" */
function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[()[\],.'"`]/g, " ")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function listEntries(absPath) {
  if (!existsSync(absPath)) return [];
  return readdirSync(absPath)
    .map((name) => ({ name, path: join(absPath, name) }))
    .filter((e) => !e.name.startsWith("."))
    .map((e) => {
      try {
        const st = statSync(e.path);
        return { ...e, isDir: st.isDirectory(), isFile: st.isFile() };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function listImages(absPath) {
  return listEntries(absPath)
    .filter((e) => e.isFile && IMAGE_EXTS.has(extname(e.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function contentType(fileName) {
  const ext = extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

function buildLookup(categories) {
  /** @type {Map<string, object[]>} */
  const byKey = new Map();
  for (const c of categories) {
    const keys = new Set(
      [normalizeKey(c.slug), normalizeKey(c.name)].filter(Boolean),
    );
    // "Food Grains & Cereals" → food-grains-and-cereals; also match food-grains-cereals
    for (const key of [...keys]) {
      keys.add(key.replace(/-and-/g, "-"));
    }
    for (const key of keys) {
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(c);
    }
  }
  // Deduplicate candidate lists (same category may be pushed via multiple keys)
  for (const [key, list] of byKey) {
    const seen = new Set();
    byKey.set(
      key,
      list.filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      }),
    );
  }
  return byKey;
}

/**
 * @returns {{ name: string, path: string } | null}
 */
function resolveImageFile(entry) {
  if (entry.isFile) {
    if (!IMAGE_EXTS.has(extname(entry.name).toLowerCase())) return null;
    return { name: entry.name, path: entry.path };
  }
  if (entry.isDir) {
    const images = listImages(entry.path);
    return images[0] ? { name: images[0].name, path: images[0].path } : null;
  }
  return null;
}

function walkAndMatch(rootDir, byKey) {
  /** @type {Array<{
   *   categoryId: string,
   *   categorySlug: string,
   *   categoryName: string,
   *   localLabel: string,
   *   image: { name: string, path: string },
   * }>} */
  const matches = [];
  const warnings = [];
  const claimed = new Set();

  for (const entry of listEntries(rootDir)) {
    const key = normalizeKey(basename(entry.name, entry.isFile ? extname(entry.name) : ""));
    const image = resolveImageFile(entry);
    if (!image) {
      if (entry.isDir) warnings.push(`SKIP folder "${entry.name}" — no image files inside`);
      continue;
    }

    const candidates = byKey.get(key) ?? [];
    if (!candidates.length) {
      warnings.push(`SKIP "${entry.name}" — no category name/slug match for "${key}"`);
      continue;
    }
    if (candidates.length > 1) {
      warnings.push(
        `SKIP "${entry.name}" — ambiguous (${candidates.length} matches: ${candidates.map((c) => c.slug).join(", ")})`,
      );
      continue;
    }

    const cat = candidates[0];
    if (claimed.has(cat.id)) {
      warnings.push(`SKIP "${entry.name}" — category "${cat.name}" already matched`);
      continue;
    }

    claimed.add(cat.id);
    matches.push({
      categoryId: cat.id,
      categorySlug: cat.slug,
      categoryName: cat.name,
      localLabel: entry.name,
      image,
    });
  }

  return { matches, warnings };
}

async function ensurePublicBucket(supabase, bucket) {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;
  if ((buckets ?? []).some((b) => b.name === bucket)) {
    console.log(`Storage bucket "${bucket}" OK`);
    return;
  }
  console.log(`Creating public storage bucket "${bucket}"…`);
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  });
  if (error) throw error;
}

async function uploadFile(supabase, bucket, objectPath, filePath, fileName) {
  const buf = readFileSync(filePath);
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buf, {
    contentType: contentType(fileName),
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage:
  node scripts/upload-category-images.mjs [--dir ./category-images] [--bucket category-images] [--dry-run]

Layouts:
  category-images/Spices.jpg
  category-images/Food Grains & Cereals.png
  category-images/pulses-dal.webp
  category-images/Spices/cover.jpg
`);
    process.exit(0);
  }

  const env = { ...loadEnv(), ...process.env };
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  if (!existsSync(args.dir)) {
    console.error(`Images root not found: ${args.dir}`);
    console.error("Create it and drop images named after category names, e.g. Spices.jpg");
    process.exit(1);
  }

  console.log(`Images root: ${args.dir}`);
  console.log(`Bucket:      ${args.bucket}`);
  console.log(`Mode:        ${args.dryRun ? "DRY RUN" : "APPLY (upload + update categories.image)"}`);

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, name, image");
  if (catErr) throw catErr;

  console.log(`DB categories: ${(categories ?? []).length}`);

  const byKey = buildLookup(categories ?? []);
  const { matches, warnings } = walkAndMatch(args.dir, byKey);
  for (const w of warnings) console.warn(w);
  console.log(`Matched images: ${matches.length}`);

  if (!matches.length) {
    console.log("Nothing to do. Name files after category names or slugs.");
    return;
  }

  if (!args.dryRun) {
    await ensurePublicBucket(supabase, args.bucket);
  }

  let updated = 0;
  let errors = 0;

  for (const m of matches) {
    const ext = extname(m.image.name).toLowerCase() || ".jpg";
    const objectPath = `categories/${m.categorySlug}${ext}`;
    const label = `${m.categorySlug} (${m.categoryName}) ← ${m.localLabel}`;

    if (args.dryRun) {
      console.log(`DRY  ${label} → ${objectPath}`);
      updated += 1;
      continue;
    }

    try {
      const publicUrl = await uploadFile(
        supabase,
        args.bucket,
        objectPath,
        m.image.path,
        m.image.name,
      );
      const { error } = await supabase
        .from("categories")
        .update({ image: publicUrl })
        .eq("id", m.categoryId);
      if (error) throw error;
      console.log(`OK   ${label}`);
      console.log(`     ${publicUrl}`);
      updated += 1;
    } catch (err) {
      errors += 1;
      console.error(`ERR  ${label}: ${err?.message ?? err}`);
    }
  }

  const unmatched = (categories ?? []).filter((c) => !matches.some((m) => m.categoryId === c.id));
  if (unmatched.length) {
    console.log(`\nCategories still without a new upload (${unmatched.length}):`);
    for (const c of unmatched) {
      console.log(`  - ${c.slug} (${c.name})${c.image ? " [has existing image]" : ""}`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
