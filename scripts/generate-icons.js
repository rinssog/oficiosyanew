/**
 * scripts/generate-icons.js — Genera íconos PWA desde el SVG del escudo
 * Uso: node scripts/generate-icons.js
 * Requiere: npm install sharp (en la raíz del proyecto)
 */
const fs = require("fs");
const path = require("path");

const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#0D3B1F" rx="16"/>
  <defs>
    <linearGradient id="f" x1="40" y1="4" x2="40" y2="76" gradientUnits="userSpaceOnUse"><stop stop-color="#16A34A"/><stop offset="1" stop-color="#0D3B1F"/></linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FAF0B0"/><stop offset="50%" stop-color="#C9A227"/><stop offset="100%" stop-color="#FAF0B0"/></linearGradient>
  </defs>
  <path d="M40 6 L70 17 L70 42 C70 58 56 69 40 75 C24 69 10 58 10 42 L10 17 Z" fill="url(#g)"/>
  <path d="M40 10 L66 20 L66 42 C66 56 53 66 40 72 C27 66 14 56 14 42 L14 20 Z" fill="#0D3B1F" opacity="0.5"/>
  <path d="M40 13 L63 23 L63 42 C63 54 51 64 40 70 C29 64 17 54 17 42 L17 23 Z" fill="url(#g)"/>
  <path d="M40 16 L60 25 L60 42 C60 52 50 61 40 67 C30 61 20 52 20 42 L20 25 Z" fill="url(#f)"/>
  <text x="40" y="46" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="20" font-weight="900" font-family="Georgia,serif">Ya</text>
</svg>`;

const SIZES = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const OUT = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function run() {
  let sharp;
  try { sharp = require("sharp"); } catch {
    console.log("Instalá sharp: npm install sharp");
    console.log("Alternativa manual: https://www.pwabuilder.com/imageGenerator");
    process.exit(1);
  }
  for (const size of SIZES) {
    await sharp(Buffer.from(SHIELD_SVG)).resize(size, size).png().toFile(path.join(OUT, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }
  console.log("\n✅ Íconos generados en public/icons/");
}
run().catch(console.error);
