// Downscale + recompress oversized /public marketing images.
// Photos are converted to JPEG; assets that need transparency stay PNG.
// Run: node scratch/optimize-public-images.mjs
import { Jimp } from "jimp";
import { statSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC = resolve(process.cwd(), "public");

/** @type {{file:string, out?:string, maxW?:number, maxH?:number, format:"jpeg"|"png", quality?:number}[]} */
const TARGETS = [
  { file: "hero-banner1.png", out: "hero-banner1.jpg", maxW: 1600, format: "jpeg", quality: 86 },
  { file: "hero-banner2.png", out: "hero-banner2.jpg", maxW: 1600, format: "jpeg", quality: 86 },
  { file: "hero-banner3.png", out: "hero-banner3.jpg", maxW: 1600, format: "jpeg", quality: 86 },
  { file: "bannerlanding.png", out: "bannerlanding.jpg", maxW: 1600, format: "jpeg", quality: 84 },
  { file: "retailer-1.png", out: "retailer-1.jpg", maxW: 640, format: "jpeg", quality: 82, dir: "retailers" },
  { file: "retailer-2.png", out: "retailer-2.jpg", maxW: 640, format: "jpeg", quality: 82, dir: "retailers" },
  { file: "retailer-3.png", out: "retailer-3.jpg", maxW: 640, format: "jpeg", quality: 82, dir: "retailers" },
  { file: "retailer-4.png", out: "retailer-4.jpg", maxW: 640, format: "jpeg", quality: 82, dir: "retailers" },
  { file: "retailer-5.png", out: "retailer-5.jpg", maxW: 640, format: "jpeg", quality: 82, dir: "retailers" },
  { file: "sell_first_pay_later.png", maxW: 900, format: "png" },
  { file: "first_bulk_order.png", maxW: 900, format: "png" },
  // Logo needs transparency → stay PNG, just shrink to display size.
  { file: "logo.png", maxH: 160, format: "png" },
];

const kb = (n) => `${Math.round(n / 1024)} KB`;

for (const t of TARGETS) {
  const dir = t.dir ? resolve(PUBLIC, t.dir) : PUBLIC;
  const inPath = resolve(dir, t.file);
  if (!existsSync(inPath)) {
    console.log(`skip (missing): ${t.file}`);
    continue;
  }
  const before = statSync(inPath).size;
  const img = await Jimp.read(inPath);
  const { width, height } = img.bitmap;

  let targetW = width;
  let targetH = height;
  if (t.maxW && width > t.maxW) {
    targetW = t.maxW;
    targetH = Math.round((height / width) * t.maxW);
  }
  if (t.maxH && targetH > t.maxH) {
    const ratio = t.maxH / targetH;
    targetH = t.maxH;
    targetW = Math.round(targetW * ratio);
  }
  if (targetW !== width || targetH !== height) {
    img.resize({ w: targetW, h: targetH });
  }

  const outName = t.out ?? t.file;
  const outPath = resolve(dir, outName);
  const mime = t.format === "jpeg" ? "image/jpeg" : "image/png";
  const buf =
    t.format === "jpeg"
      ? await img.getBuffer(mime, { quality: t.quality ?? 82 })
      : await img.getBuffer(mime);
  writeFileSync(outPath, buf);

  console.log(
    `${t.file} (${width}x${height}, ${kb(before)}) -> ${outName} (${targetW}x${targetH}, ${kb(buf.length)})`,
  );
}

console.log("done");
