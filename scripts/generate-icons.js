import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Color scheme - medical/nursing theme (calm blue)
const bgColor = '#3b82f6'; // Blue
const textColor = '#ffffff'; // White

// Create SVG with "PZ" text
function createSvg(size) {
  const fontSize = Math.floor(size * 0.4);
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}" rx="${size * 0.1}"/>
      <text
        x="50%"
        y="55%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
      >PZ</text>
    </svg>
  `);
}

// Generate icons
async function generateIcons() {
  const sizes = [
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const svg = createSvg(size);
    await sharp(svg)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Created ${name}`);
  }

  // Create favicon.svg
  const faviconSvg = createSvg(32);
  await sharp(faviconSvg)
    .toFile(join(publicDir, 'favicon.svg'));
  console.log('Created favicon.svg');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
