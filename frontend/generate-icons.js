// Script para generar iconos PWA como PNG
const sharp = require('sharp');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVG(size) {
  const fontSize = Math.round(size * 0.3);
  const smallFont = Math.round(size * 0.1);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#1a1a2e"/>
  <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#d4a574" font-family="Arial, sans-serif">&#9749;</text>
  <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" font-size="${smallFont}" fill="#e8d5b7" font-family="Arial, sans-serif" font-weight="bold">ArteCafexa</text>
</svg>`);
}

const iconsDir = path.join(__dirname, 'public', 'icons');

async function main() {
  for (const size of sizes) {
    const svg = generateSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(outputPath);
    console.log(`Created icon-${size}x${size}.png`);
  }
  console.log('\nAll PWA icons generated!');
}

main().catch(console.error);
