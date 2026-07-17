// One-off: the operator replaced public/hero-banner0.jpg with 1600x900 art.
// The hero canvas is 2:1 (object-cover), which would crop the people at the
// bottom. Trim 100px of empty top margin instead -> exact 1600x800 (2:1).
import { Jimp } from "jimp";
import path from "node:path";

const FILE = path.join(process.cwd(), "public", "hero-banner0.jpg");

const img = await Jimp.read(FILE);
const { width, height } = img.bitmap;
console.log("source:", width, "x", height);

const targetH = Math.round(width / 2);
if (height <= targetH) {
  console.log("Already 2:1 or wider — nothing to do.");
  process.exit(0);
}

// Take all the excess from the top (empty background above the headline);
// keep the bottom edge so the people are never cropped.
const cropTop = height - targetH;
img.crop({ x: 0, y: cropTop, w: width, h: targetH });

await img.write(FILE, { quality: 88 });
console.log("Wrote", FILE, width, "x", targetH, `(cropped ${cropTop}px off the top)`);
