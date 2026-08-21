import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../client/public');
const darkLogo = path.join(publicDir, 'vuela-logo-dark.png');

async function makeFavicons() {
  const darkLogoBuffer = fs.readFileSync(darkLogo);

  // Resize so width spans 485px out of 512px (maximum possible visibility on browser tabs)
  const resizedPureBlackLogo = await sharp(darkLogoBuffer)
    .resize({ width: 485, height: 320, fit: 'inside' })
    .toBuffer();

  // Create 512x512 white background with subtle border for dark mode tabs
  const favicon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Pure #FFFFFF
    }
  })
  .composite([
    {
      input: resizedPureBlackLogo,
      gravity: 'center'
    }
  ])
  .png()
  .toBuffer();

  const favicon32 = await sharp(favicon512).resize(32, 32).png().toBuffer();
  const favicon48 = await sharp(favicon512).resize(48, 48).png().toBuffer();
  const favicon192 = await sharp(favicon512).resize(192, 192).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon512);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), favicon48);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon48);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), favicon192);

  // SVG Favicon with crisp vector container
  const base64Png = favicon512.toString('base64');
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="100" fill="#ffffff" stroke="#e2e8f0" stroke-width="12" />
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
  console.log('Successfully generated pure black on white favicon in all sizes!');
}

makeFavicons().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
