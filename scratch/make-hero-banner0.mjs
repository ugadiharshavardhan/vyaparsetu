// One-off: fit the provided "Helping local retailers grow" art onto the hero's
// 2:1 canvas (no cropping of the people) and save as public/hero-banner0.jpg.
import { Jimp } from "jimp";
import path from "node:path";

const SRC = String.raw`C:\Users\U HARSHA VARDHAN\.cursor\projects\c-Users-U-HARSHA-VARDHAN-Desktop-vyaparsetuin\assets\c__Users_U_HARSHA_VARDHAN_AppData_Roaming_Cursor_User_workspaceStorage_0868185b5e0c706fa209031e51bd3fbc_images_image-8bdf1135-61ff-40c7-a024-de2520dcacc1.png`;
const OUT = path.join(process.cwd(), "public", "hero-banner0.jpg");

const img = await Jimp.read(SRC);
const { width, height } = img.bitmap;
console.log("source:", width, "x", height);

// 2:1 target canvas, same width as the source.
const canvasW = width;
const canvasH = Math.round(width / 2);

// Sample the background color from the top-left corner.
const corner = img.getPixelColor(2, 2);
const canvas = new Jimp({ width: canvasW, height: canvasH, color: corner });

// Anchor the art to the BOTTOM (people stand on the bottom edge); the extra
// background goes above the headline where the art is already empty.
canvas.composite(img, 0, canvasH - height);

await canvas.write(OUT, { quality: 88 });
console.log("Wrote", OUT, canvasW, "x", canvasH);
