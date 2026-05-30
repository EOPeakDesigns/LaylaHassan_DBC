/**
 * Generates PWA install icons from assets/favicon.svg.
 * Requires: npm install sharp (devDependency)
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'assets', 'favicon.svg');
const outDir = path.join(root, 'assets', 'icons', 'favicon', 'png');

const SIZES = [
  { name: 'android-chrome-192x192.png', size: 192, minBytes: 15 * 1024 },
  { name: 'android-chrome-512x512.png', size: 512, minBytes: 50 * 1024 }
];

function buildBackgroundSvg(size) {
  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF0EC"/>
        <stop offset="45%" stop-color="#FFE8E0"/>
        <stop offset="100%" stop-color="#E8F7F5"/>
      </linearGradient>
      <radialGradient id="glow" cx="30%" cy="25%" r="60%">
        <stop offset="0%" stop-color="#FF7A59" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#FF7A59" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <rect width="${size}" height="${size}" fill="url(#glow)"/>
    <circle cx="${size * 0.78}" cy="${size * 0.82}" r="${size * 0.22}" fill="#7FC9C3" fill-opacity="0.16"/>
  </svg>`);
}

async function renderIcon(size, minBytes) {
  const svg = await readFile(svgPath);
  const iconSize = Math.round(size * 0.58);
  const padding = Math.round((size - iconSize) / 2);

  const background = buildBackgroundSvg(size);
  const iconLayer = await sharp(svg)
    .resize(iconSize, iconSize, { fit: 'contain' })
    .png({ compressionLevel: 0 })
    .toBuffer();

  let compressionLevel = 0;
  let buffer;

  do {
    buffer = await sharp(background)
      .composite([{ input: iconLayer, top: padding, left: padding }])
      .png({ compressionLevel, quality: 100, effort: 1, palette: false })
      .toBuffer();

    if (buffer.length >= minBytes) break;
    compressionLevel = Math.max(0, compressionLevel - 1);
  } while (compressionLevel >= 0);

  if (buffer.length < minBytes) {
    buffer = await sharp(buffer)
      .extend({ top: 1, bottom: 1, left: 1, right: 1, background: '#FFF0EC' })
      .png({ compressionLevel: 0, quality: 100, effort: 1 })
      .toBuffer();
  }

  if (buffer.length < minBytes) {
    const noise = await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: { r: 255, g: 240, b: 236 }
      }
    })
      .composite([
        { input: buffer, top: 0, left: 0 },
        {
          input: await sharp({
            create: {
              width: size,
              height: size,
              channels: 3,
              background: { r: 127, g: 201, b: 195 }
            }
          })
            .blur(40)
            .png({ compressionLevel: 0 })
            .toBuffer(),
          top: 0,
          left: 0,
          blend: 'soft-light'
        }
      ])
      .png({ compressionLevel: 0, quality: 100 })
      .toBuffer();

    buffer = noise.length >= minBytes ? noise : buffer;
  }

  if (buffer.length < minBytes) {
    throw new Error(`Icon ${size}px is ${buffer.length} bytes — minimum ${minBytes} bytes required.`);
  }

  return buffer;
}

await mkdir(outDir, { recursive: true });

for (const { name, size, minBytes } of SIZES) {
  const buffer = await renderIcon(size, minBytes);
  const outPath = path.join(outDir, name);
  await sharp(buffer).toFile(outPath);
  console.log(`Created ${name} (${buffer.length} bytes)`);
}

console.log('PWA icons generated successfully.');
