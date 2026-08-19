// One-off script: generates the PWA app icons from public/brand/logo.png
// (item 2 "PWA"). Run with: npx tsx scripts/generate-icons.ts
//
// Produces:
//   public/icons/icon-192.png       — 192x192, plain (any purpose)
//   public/icons/icon-512.png       — 512x512, plain (any purpose)
//   public/icons/icon-maskable-512.png — 512x512, maskable (logo padded
//     into the ~80% "safe zone" circle on a brand-purple background so
//     Android's adaptive-icon mask never crops the logo).
//
// Safe to re-run — always overwrites.

import { mkdirSync, existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const SRC = path.join(__dirname, "..", "public", "brand", "logo.png");
const OUT_DIR = path.join(__dirname, "..", "public", "icons");
// Sampled from app/globals.css --color-terracotta-to, the deep blue-violet
// end of the brand gradient — used as the maskable icon's background so the
// safe-zone padding blends with the rest of the brand palette.
const BRAND_BG = "#4c3a9e";

async function main() {
  if (!existsSync(SRC)) {
    console.error(`Source logo not found at ${SRC}`);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  await sharp(SRC).resize(192, 192, { fit: "cover" }).png().toFile(path.join(OUT_DIR, "icon-192.png"));
  console.log("wrote icon-192.png");

  await sharp(SRC).resize(512, 512, { fit: "cover" }).png().toFile(path.join(OUT_DIR, "icon-512.png"));
  console.log("wrote icon-512.png");

  // Maskable: logo scaled to ~80% of the canvas (the standard "safe zone"),
  // centered on a solid brand-colored 512x512 background.
  const inner = Math.round(512 * 0.8);
  const logoBuf = await sharp(SRC).resize(inner, inner, { fit: "cover" }).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logoBuf, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, "icon-maskable-512.png"));
  console.log("wrote icon-maskable-512.png");

  // Verify dimensions of what we just wrote.
  for (const [file, size] of [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["icon-maskable-512.png", 512],
  ] as const) {
    const meta = await sharp(path.join(OUT_DIR, file)).metadata();
    if (meta.width !== size || meta.height !== size) {
      throw new Error(`${file}: expected ${size}x${size}, got ${meta.width}x${meta.height}`);
    }
  }
  console.log("All icons verified.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
