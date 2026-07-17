// One-off: build a circular favicon from the brand mark (public/logo1.png).
// Output: public/favicon-round.png (512x512, transparent outside the circle,
// white badge + brand-green ring so the round shape reads on any tab background).
import { Jimp } from "jimp";
import path from "node:path";

const root = process.cwd();
const SIZE = 512;
const BRAND = { r: 0x0f, g: 0x5f, b: 0x4a }; // #0F5F4A theme color

const mark = await Jimp.read(path.join(root, "public", "logo1.png"));

// White circular badge so the mark reads cleanly on light & dark tab bars.
const canvas = new Jimp({ width: SIZE, height: SIZE, color: 0xffffffff });

// Scale the mark to ~64% of the badge and center it.
const target = Math.round(SIZE * 0.64);
const ratio = Math.min(target / mark.bitmap.width, target / mark.bitmap.height);
mark.resize({
  w: Math.round(mark.bitmap.width * ratio),
  h: Math.round(mark.bitmap.height * ratio),
});
canvas.composite(
  mark,
  Math.round((SIZE - mark.bitmap.width) / 2),
  Math.round((SIZE - mark.bitmap.height) / 2),
);

// Mask to a circle (transparent corners).
canvas.circle();

// Brand-green ring just inside the circle edge.
const cx = SIZE / 2;
const cy = SIZE / 2;
const outer = SIZE / 2 - 1;
const ringWidth = SIZE * 0.045;
const inner = outer - ringWidth;
canvas.scan(0, 0, SIZE, SIZE, (x, y, idx) => {
  const d = Math.hypot(x - cx + 0.5, y - cy + 0.5);
  if (d >= inner && d <= outer && canvas.bitmap.data[idx + 3] > 0) {
    // Soft anti-aliased inner edge of the ring.
    const t = Math.min(1, (d - inner) / 1.5);
    const { data } = canvas.bitmap;
    data[idx] = Math.round(data[idx] * (1 - t) + BRAND.r * t);
    data[idx + 1] = Math.round(data[idx + 1] * (1 - t) + BRAND.g * t);
    data[idx + 2] = Math.round(data[idx + 2] * (1 - t) + BRAND.b * t);
  }
});

await canvas.write(path.join(root, "public", "favicon-round.png"));
console.log("Wrote public/favicon-round.png");
