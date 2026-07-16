/**
 * Create catalog products from a public/ folder tree and upload their images
 * to Supabase Storage.
 *
 * Expected layout (folder names = DB slugs):
 *
 *   public/
 *     food-grains-cereals/          ← categories.slug
 *       rice/                       ← subcategories.slug (under that category)
 *         basmati-rice-25kg/        ← NEW product (folder name → product name/slug)
 *           1.jpg
 *           2.png
 *         sona-masoori-10kg/
 *           photo.webp
 *
 * Flow:
 *   1. Load categories + subcategories from Supabase
 *   2. Walk only folders whose names match category / subcategory slugs
 *   3. For each item folder under a subcategory → create (or update) a product
 *      with correct category_slug + subcategory_id + sub_category
 *   4. Upload images to Storage bucket `product-images`
 *   5. Set products.image + products.images to the public URLs
 *
 * Usage:
 *   node scripts/upload-product-images.mjs --dry-run
 *   node scripts/upload-product-images.mjs
 *   node scripts/upload-product-images.mjs --dir ./public
 *   node scripts/upload-product-images.mjs --seller-email ugadiharshavardhan@gmail.com
 *   node scripts/upload-product-images.mjs --brand "VyaparSetu" --price 100 --mrp 120
 *
 * Requires .env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const DEFAULT_BUCKET = "product-images";
const DEFAULT_DIR = resolve(process.cwd(), "public");

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
    brand: "Generic",
    price: 99,
    mrp: 129,
    moq: 1,
    unit: "unit",
    gstRate: 5,
    stock: 100,
    sellerEmail: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" && argv[i + 1]) out.dir = resolve(argv[++i]);
    else if (a === "--bucket" && argv[i + 1]) out.bucket = argv[++i];
    else if (a === "--brand" && argv[i + 1]) out.brand = argv[++i];
    else if (a === "--price" && argv[i + 1]) out.price = Number(argv[++i]);
    else if (a === "--mrp" && argv[i + 1]) out.mrp = Number(argv[++i]);
    else if (a === "--moq" && argv[i + 1]) out.moq = Number(argv[++i]);
    else if (a === "--unit" && argv[i + 1]) out.unit = argv[++i];
    else if (a === "--gst" && argv[i + 1]) out.gstRate = Number(argv[++i]);
    else if (a === "--stock" && argv[i + 1]) out.stock = Number(argv[++i]);
    else if (a === "--seller-email" && argv[i + 1]) out.sellerEmail = argv[++i].trim().toLowerCase();
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

/** Folder / slug equality: exact slug match after normalize. */
function normalizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugify(value) {
  const s = normalizeSlug(value);
  return s || `product-${Date.now()}`;
}

/** "basmati-rice-25kg" → "Basmati Rice 25kg" */
function humanizeFolderName(folderName) {
  return String(folderName)
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function listDirs(absPath) {
  if (!existsSync(absPath)) return [];
  return readdirSync(absPath)
    .map((name) => ({ name, path: join(absPath, name) }))
    .filter((e) => {
      try {
        return statSync(e.path).isDirectory() && !e.name.startsWith(".");
      } catch {
        return false;
      }
    });
}

function listImages(absPath) {
  if (!existsSync(absPath)) return [];
  return readdirSync(absPath)
    .map((name) => ({ name, path: join(absPath, name) }))
    .filter((e) => {
      try {
        if (!statSync(e.path).isFile()) return false;
        return IMAGE_EXTS.has(extname(e.name).toLowerCase());
      } catch {
        return false;
      }
    })
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

/**
 * Walk public/: only category-slug dirs → subcategory-slug dirs → item dirs.
 * Returns planned create rows with resolved DB category/subcategory.
 */
function walkAndMatch(rootDir, categoriesBySlug, subcategories) {
  /** @type {Array<{
   *   categorySlug: string,
   *   categoryId: string,
   *   subcategorySlug: string,
   *   subcategoryId: string,
   *   subcategoryName: string,
   *   itemFolder: string,
   *   productName: string,
   *   productSlug: string,
   *   images: { name: string, path: string }[],
   * }>} */
  const items = [];
  const warnings = [];

  for (const catDir of listDirs(rootDir)) {
    const catSlug = normalizeSlug(catDir.name);
    const category = categoriesBySlug.get(catSlug);
    if (!category) {
      warnings.push(`SKIP category folder "${catDir.name}" — no categories.slug match`);
      continue;
    }

    const subsForCat = subcategories.filter((s) => s.category_id === category.id);
    const subsBySlug = new Map(subsForCat.map((s) => [normalizeSlug(s.slug), s]));

    for (const subDir of listDirs(catDir.path)) {
      const subSlug = normalizeSlug(subDir.name);
      const subcategory = subsBySlug.get(subSlug);
      if (!subcategory) {
        warnings.push(
          `SKIP subcategory folder "${catDir.name}/${subDir.name}" — no subcategories.slug under category "${category.slug}"`,
        );
        continue;
      }

      for (const itemDir of listDirs(subDir.path)) {
        const images = listImages(itemDir.path);
        if (!images.length) {
          warnings.push(`SKIP item "${catDir.name}/${subDir.name}/${itemDir.name}" — no image files`);
          continue;
        }

        const productSlug = slugify(itemDir.name);
        items.push({
          categorySlug: category.slug,
          categoryId: category.id,
          subcategorySlug: subcategory.slug,
          subcategoryId: subcategory.id,
          subcategoryName: subcategory.name,
          itemFolder: itemDir.name,
          productName: humanizeFolderName(itemDir.name),
          productSlug,
          images,
        });
      }
    }
  }

  return { items, warnings };
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

async function resolveSeller(supabase, email) {
  if (!email) return null;
  const { data: sellerRow, error } = await supabase
    .from("sellers")
    .select("id, email, business_name, full_name")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  if (!sellerRow) throw new Error(`No seller found for email ${email}`);
  return sellerRow;
}

async function uniqueProductSlug(supabase, baseSlug, existingSlugs) {
  let slug = baseSlug;
  let n = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  // Also check DB in case map is stale
  const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
  if (data) {
    existingSlugs.add(slug);
    return uniqueProductSlug(supabase, baseSlug, existingSlugs);
  }
  existingSlugs.add(slug);
  return slug;
}

async function refreshCategoryCounts(supabase, categorySlugs) {
  for (const slug of categorySlugs) {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_slug", slug);
    if (error) {
      console.warn(`  could not recount products for ${slug}: ${error.message}`);
      continue;
    }
    await supabase.from("categories").update({ product_count: count ?? 0 }).eq("slug", slug);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage:
  node scripts/upload-product-images.mjs [--dir ./public] [--dry-run]
       [--brand Name] [--price 99] [--mrp 129] [--seller-email you@mail.com]

Folder layout:
  public/<category-slug>/<subcategory-slug>/<item-folder>/*.{jpg,png,webp}
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
    process.exit(1);
  }

  console.log(`Images root: ${args.dir}`);
  console.log(`Bucket:      ${args.bucket}`);
  console.log(`Mode:        ${args.dryRun ? "DRY RUN" : "APPLY (create products + upload)"}`);

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, name");
  if (catErr) throw catErr;

  const { data: subcategories, error: subErr } = await supabase
    .from("subcategories")
    .select("id, category_id, slug, name");
  if (subErr) throw subErr;

  const categoriesBySlug = new Map((categories ?? []).map((c) => [normalizeSlug(c.slug), c]));
  console.log(`DB categories: ${(categories ?? []).length}, subcategories: ${(subcategories ?? []).length}`);

  const { items, warnings } = walkAndMatch(args.dir, categoriesBySlug, subcategories ?? []);
  for (const w of warnings) console.warn(w);
  console.log(`Item folders ready to import: ${items.length}`);

  if (!items.length) {
    console.log("Nothing to do. Put folders under public/<category-slug>/<subcategory-slug>/<item>/");
    return;
  }

  const { data: existingProducts, error: prodErr } = await supabase
    .from("products")
    .select("id, slug, name, category_slug, subcategory_id");
  if (prodErr) throw prodErr;

  const existingSlugs = new Set((existingProducts ?? []).map((p) => p.slug));
  /** Match existing by subcategory_id + normalized name/slug of folder */
  const existingBySubAndSlug = new Map();
  for (const p of existingProducts ?? []) {
    if (p.subcategory_id) {
      existingBySubAndSlug.set(`${p.subcategory_id}|${normalizeSlug(p.slug)}`, p);
      existingBySubAndSlug.set(`${p.subcategory_id}|${normalizeSlug(p.name)}`, p);
    }
  }

  let seller = null;
  if (!args.dryRun) {
    await ensurePublicBucket(supabase, args.bucket);
    if (args.sellerEmail) {
      seller = await resolveSeller(supabase, args.sellerEmail);
      console.log(`Assigning seller: ${seller.email} (${seller.id})`);
    }
  }

  const summary = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const touchedCategories = new Set();

  for (const item of items) {
    const pathLabel = `${item.categorySlug}/${item.subcategorySlug}/${item.itemFolder}`;
    const lookupKey = `${item.subcategoryId}|${normalizeSlug(item.productSlug)}`;
    const lookupName = `${item.subcategoryId}|${normalizeSlug(item.productName)}`;
    const existing =
      existingBySubAndSlug.get(lookupKey) || existingBySubAndSlug.get(lookupName) || null;

    console.log(
      `${existing ? "UPDATE" : "CREATE"}  ${pathLabel}  →  ${item.productName}  [${item.categorySlug} / ${item.subcategorySlug}]`,
    );

    if (args.dryRun) {
      console.log(`  would upload ${item.images.length} image(s)`);
      if (existing) summary.updated += 1;
      else summary.created += 1;
      continue;
    }

    try {
      const productId = existing?.id ?? randomUUID();
      const urls = [];
      for (const img of item.images) {
        const safeName = basename(img.name).replace(/[^\w.\-]+/g, "_");
        const objectPath = `${productId}/${safeName}`;
        const publicUrl = await uploadFile(supabase, args.bucket, objectPath, img.path, img.name);
        urls.push(publicUrl);
        console.log(`  uploaded ${img.name}`);
      }

      if (!urls.length) {
        summary.skipped += 1;
        continue;
      }

      if (existing) {
        const { error: updErr } = await supabase
          .from("products")
          .update({
            image: urls[0],
            images: urls,
            category_slug: item.categorySlug,
            subcategory_id: item.subcategoryId,
            sub_category: item.subcategorySlug,
            seller_id: seller?.id ?? undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (updErr) throw updErr;
        summary.updated += 1;
        console.log(`  product updated (${existing.id})`);
      } else {
        const slug = await uniqueProductSlug(supabase, item.productSlug, existingSlugs);
        const supplier = seller
          ? {
              id: seller.id,
              name: seller.business_name || seller.full_name || "Seller",
              location: "",
              verified: true,
              rating: 4.5,
            }
          : {
              id: "catalog",
              name: "VyaparSetu Catalog",
              location: "India",
              verified: true,
              rating: 4.5,
            };

        const row = {
          id: productId,
          slug,
          name: item.productName,
          brand: args.brand,
          category_slug: item.categorySlug,
          sub_category: item.subcategorySlug,
          subcategory_id: item.subcategoryId,
          sku: slug.toUpperCase().slice(0, 32),
          image: urls[0],
          images: urls,
          wholesale_price: args.price,
          mrp: args.mrp,
          moq: args.moq,
          unit: args.unit,
          gst_included: true,
          gst_rate: args.gstRate,
          supplier,
          seller_id: seller?.id ?? null,
          rating: 0,
          review_count: 0,
          in_stock: true,
          stock_count: args.stock,
          featured: false,
          description: `${item.productName} — wholesale ${item.subcategoryName} under ${item.categorySlug}.`,
          specifications: {},
          highlights: [],
          packaging_details: null,
          delivery_days: 3,
          delivery_estimate: "2-4 business days",
        };

        const { error: insErr } = await supabase.from("products").insert(row);
        if (insErr) throw insErr;

        if (seller?.id) {
          await supabase.from("seller_products").upsert(
            {
              id: randomUUID(),
              seller_id: seller.id,
              product_id: productId,
            },
            { onConflict: "product_id" },
          );
        }

        existingBySubAndSlug.set(`${item.subcategoryId}|${normalizeSlug(slug)}`, {
          id: productId,
          slug,
          name: item.productName,
          category_slug: item.categorySlug,
          subcategory_id: item.subcategoryId,
        });
        summary.created += 1;
        console.log(`  product created (${productId}, slug=${slug})`);
      }

      touchedCategories.add(item.categorySlug);
    } catch (err) {
      const msg = err?.message ?? String(err);
      console.error(`  ERROR ${pathLabel}: ${msg}`);
      summary.errors.push({ path: pathLabel, error: msg });
    }
  }

  if (!args.dryRun && touchedCategories.size) {
    console.log("Refreshing category product_count…");
    await refreshCategoryCounts(supabase, touchedCategories);
  }

  console.log("\n—— Summary ——");
  console.log(`Created:  ${summary.created}`);
  console.log(`Updated:  ${summary.updated}`);
  console.log(`Skipped:  ${summary.skipped}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Errors:   ${summary.errors.length}`);
  if (summary.errors.length) {
    for (const e of summary.errors) console.log(`  - ${e.path}: ${e.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
