/**
 * Slice a sheet of company logos (a1, a2, a3, …) into individual logos,
 * upload each to Supabase Storage, and insert a row into public.manufacturers.
 *
 * Each sheet (e.g. public/a1.png) contains multiple company logos laid out on a
 * plain background. Logos are detected automatically using row/column
 * projection segmentation (no fixed grid assumption), then trimmed to a tight
 * bounding box before upload.
 *
 * Optional per-sheet names: put a JSON array of names next to the image, e.g.
 *   public/a1.names.json  ->  ["Amul", "Tata", "Nestle", …]   (reading order)
 * Otherwise names default to "<base>-01", "<base>-02", … (rename later in DB).
 *
 * Usage:
 *   node scripts/slice-manufacturer-logos.mjs --dry-run
 *   node scripts/slice-manufacturer-logos.mjs
 *   node scripts/slice-manufacturer-logos.mjs --dir ./public --files a1,a2,a3
 *   node scripts/slice-manufacturer-logos.mjs --grid 2x5      # force uniform grid
 *   node scripts/slice-manufacturer-logos.mjs --expect 10 --bucket manufacturer-logos
 *
 * Requires .env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 * Requires table: run scratch/APPLY_MANUFACTURERS.sql first.
 */
import { createClient } from "@supabase/supabase-js";
import { Jimp } from "jimp";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULT_BUCKET = "manufacturer-logos";
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
    files: null, // explicit list, else auto a\d+
    bucket: DEFAULT_BUCKET,
    grid: null, // { rows, cols } to force uniform slicing
    expect: 0, // warn if detected count != expect (0 = no check)
    prefix: null, // naming prefix for all sheets (e.g. "c" → c1, c2, …)
    map: null, // per-sheet prefix map, e.g. { a1: "c", k1: "s" }
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir" && argv[i + 1]) out.dir = resolve(argv[++i]);
    else if (a === "--files" && argv[i + 1]) out.files = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--bucket" && argv[i + 1]) out.bucket = argv[++i];
    else if (a === "--expect" && argv[i + 1]) out.expect = Number(argv[++i]);
    else if (a === "--prefix" && argv[i + 1]) out.prefix = argv[++i].trim();
    else if (a === "--map" && argv[i + 1]) {
      out.map = {};
      for (const pair of argv[++i].split(",")) {
        const [base, pfx] = pair.split("=").map((s) => s.trim());
        if (base && pfx) out.map[base.toLowerCase()] = pfx;
      }
    } else if (a === "--grid" && argv[i + 1]) {
      const m = String(argv[++i]).match(/^(\d+)\s*[xX]\s*(\d+)$/);
      if (m) out.grid = { rows: Number(m[1]), cols: Number(m[2]) };
    } else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Discover sheet files: explicit list or auto a1, a2, … */
function discoverSheets(dir, files) {
  const entries = readdirSync(dir).filter((n) => IMAGE_EXTS.has(extname(n).toLowerCase()));
  if (files) {
    const picked = [];
    for (const want of files) {
      const found = entries.find((n) => basename(n, extname(n)).toLowerCase() === want.toLowerCase());
      if (found) picked.push(found);
      else console.warn(`SKIP requested "${want}" — not found in ${dir}`);
    }
    return picked;
  }
  return entries
    .filter((n) => /^a\d+$/i.test(basename(n, extname(n))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Average of the four corner pixels → background colour. */
function detectBackground(img) {
  const { width, height, data } = img.bitmap;
  const pts = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
  ];
  let r = 0, g = 0, b = 0;
  for (const [x, y] of pts) {
    const idx = (y * width + x) * 4;
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
  }
  const n = pts.length;
  return { r: r / n, g: g / n, b: b / n };
}

/** True when the pixel is "ink" (part of a logo), i.e. not background. */
function makeIsContent(img, bg) {
  const { data } = img.bitmap;
  const THRESH = 38; // colour distance from background
  return (x, y, width) => {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a < 24) return false; // transparent
    const dr = data[idx] - bg.r;
    const dg = data[idx + 1] - bg.g;
    const db = data[idx + 2] - bg.b;
    return Math.sqrt(dr * dr + dg * dg + db * db) > THRESH;
  };
}

/**
 * Split a 1-D profile (counts per index) into segments where count > minCount,
 * merging across gaps smaller than minGap. Returns [start,end] inclusive ranges.
 */
function segments(profile, minCount, minGap) {
  const ranges = [];
  let start = -1;
  let gap = 0;
  for (let i = 0; i < profile.length; i++) {
    if (profile[i] > minCount) {
      if (start === -1) start = i;
      else if (gap > 0 && gap < minGap) {
        // absorb small gap
      }
      gap = 0;
    } else if (start !== -1) {
      gap++;
      if (gap >= minGap) {
        ranges.push([start, i - gap]);
        start = -1;
        gap = 0;
      }
    }
  }
  if (start !== -1) ranges.push([start, profile.length - 1 - gap]);
  return ranges;
}

/** Auto-detect logo bounding boxes via row → column projection profiles. */
function detectBoxes(img) {
  const { width, height } = img.bitmap;
  const bg = detectBackground(img);
  const isContent = makeIsContent(img, bg);

  // Row profile
  const rowProfile = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let c = 0;
    for (let x = 0; x < width; x++) if (isContent(x, y, width)) c++;
    rowProfile[y] = c;
  }
  const rowBands = segments(
    rowProfile,
    Math.max(2, Math.floor(width * 0.004)),
    Math.max(6, Math.floor(height * 0.02)),
  ).filter(([s, e]) => e - s > Math.floor(height * 0.02));

  const boxes = [];
  for (const [y0, y1] of rowBands) {
    // Column profile within this band
    const colProfile = new Array(width).fill(0);
    for (let x = 0; x < width; x++) {
      let c = 0;
      for (let y = y0; y <= y1; y++) if (isContent(x, y, width)) c++;
      colProfile[x] = c;
    }
    const colSegs = segments(
      colProfile,
      Math.max(2, Math.floor((y1 - y0) * 0.02)),
      Math.max(8, Math.floor(width * 0.015)),
    ).filter(([s, e]) => e - s > Math.floor(width * 0.01));

    for (const [x0, x1] of colSegs) {
      // Tight vertical trim inside this cell
      let ty0 = y1, ty1 = y0;
      for (let y = y0; y <= y1; y++) {
        let hit = false;
        for (let x = x0; x <= x1; x++) if (isContent(x, y, width)) { hit = true; break; }
        if (hit) { ty0 = Math.min(ty0, y); ty1 = Math.max(ty1, y); }
      }
      if (ty1 < ty0) continue;
      boxes.push({ x: x0, y: ty0, w: x1 - x0 + 1, h: ty1 - ty0 + 1 });
    }
  }
  return boxes;
}

/** Uniform grid boxes (fallback when --grid is provided). */
function gridBoxes(img, rows, cols) {
  const { width, height } = img.bitmap;
  const cw = Math.floor(width / cols);
  const ch = Math.floor(height / rows);
  const boxes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      boxes.push({ x: c * cw, y: r * ch, w: cw, h: ch });
    }
  }
  return boxes;
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
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/webp", "image/jpeg"],
  });
  if (error) throw error;
}

function loadNames(dir, base, count) {
  const path = join(dir, `${base}.names.json`);
  if (!existsSync(path)) return null;
  try {
    const arr = JSON.parse(readFileSync(path, "utf8"));
    if (Array.isArray(arr)) return arr.map((s) => String(s));
  } catch (e) {
    console.warn(`Could not parse ${base}.names.json: ${e.message}`);
  }
  return null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage:
  node scripts/slice-manufacturer-logos.mjs [--dir ./public] [--files a1,a2,a3]
       [--grid 2x5] [--expect 10] [--bucket manufacturer-logos] [--dry-run]

Put sheets in ./public named a1.png, a2.png, a3.png (each with the logos).
Optional names: ./public/a1.names.json = ["Amul","Tata", …]  (reading order)
Run scratch/APPLY_MANUFACTURERS.sql once before applying.
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
    console.error(`Directory not found: ${args.dir}`);
    process.exit(1);
  }

  const sheets = discoverSheets(args.dir, args.files);
  if (!sheets.length) {
    console.error(`No sheets found. Add a1.png, a2.png, … to ${args.dir} (or pass --files).`);
    process.exit(1);
  }

  console.log(`Dir:    ${args.dir}`);
  console.log(`Sheets: ${sheets.join(", ")}`);
  console.log(`Bucket: ${args.bucket}`);
  console.log(`Mode:   ${args.dryRun ? "DRY RUN" : "APPLY (upload + insert manufacturers)"}`);
  console.log(`Detect: ${args.grid ? `uniform grid ${args.grid.rows}x${args.grid.cols}` : "auto (projection)"}`);

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  if (!args.dryRun) await ensurePublicBucket(supabase, args.bucket);

  let globalOrder = 0;
  let inserted = 0;
  let errors = 0;

  for (const file of sheets) {
    const base = basename(file, extname(file)).toLowerCase();
    const tag = (args.map && args.map[base]) || args.prefix || base;
    const abs = join(args.dir, file);
    const img = await Jimp.read(abs);
    const { width, height } = img.bitmap;

    let boxes = args.grid ? gridBoxes(img, args.grid.rows, args.grid.cols) : detectBoxes(img);
    // Reading order: top→bottom, then left→right, grouping rows by vertical overlap
    boxes.sort((a, b) => (Math.abs(a.y - b.y) > Math.min(a.h, b.h) * 0.5 ? a.y - b.y : a.x - b.x));

    console.log(`\n${file}  (${width}x${height}) → detected ${boxes.length} logos`);
    if (args.expect && boxes.length !== args.expect) {
      console.warn(
        `  ! expected ${args.expect}, got ${boxes.length}. Try --grid 2x5 (or 5x2) to force a uniform slice.`,
      );
    }

    const names = loadNames(args.dir, base, boxes.length);

    if (!args.dryRun) {
      // Replace any prior rows/objects for this sheet so re-runs stay clean
      await supabase.from("manufacturers").delete().eq("source_image", base);
    }

    for (let i = 0; i < boxes.length; i++) {
      const idx = i + 1;
      globalOrder += 1;
      const box = boxes[i];
      // small padding around the tight box
      const pad = Math.round(Math.min(box.w, box.h) * 0.06);
      const x = Math.max(0, box.x - pad);
      const y = Math.max(0, box.y - pad);
      const w = Math.min(width - x, box.w + pad * 2);
      const h = Math.min(height - y, box.h + pad * 2);

      const code = `${tag}${idx}`; // e.g. c1 … c10, s1 … s10
      const name = (names && names[i]) || code;
      const slug = code;
      const label = `${base} #${idx} → ${code} (${name}) [${w}x${h}]`;

      if (args.dryRun) {
        console.log(`  DRY  ${label}`);
        continue;
      }

      try {
        const crop = img.clone().crop({ x, y, w, h });
        const buf = await crop.getBuffer("image/png");
        const objectPath = `${tag}/${code}.png`;
        const { error: upErr } = await supabase.storage
          .from(args.bucket)
          .upload(objectPath, buf, { contentType: "image/png", upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(args.bucket).getPublicUrl(objectPath);

        const { error: insErr } = await supabase.from("manufacturers").upsert(
          {
            id: `mf-${code}`,
            name,
            slug,
            logo: pub.publicUrl,
            source_image: base,
            sort_order: globalOrder,
          },
          { onConflict: "id" },
        );
        if (insErr) throw insErr;
        console.log(`  OK   ${label}`);
        inserted += 1;
      } catch (err) {
        errors += 1;
        console.error(`  ERR  ${label}: ${err?.message ?? err}`);
      }
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Errors: ${errors}`);
  if (args.dryRun) console.log("Dry run only — re-run without --dry-run to upload + insert.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
