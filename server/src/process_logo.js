import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImgPath = 'C:/Users/Vamsi Teja/.gemini/antigravity/brain/41c21ed2-33f7-4c22-bc53-5ace53633862/.user_uploaded/media_1787312827996.png';
const publicDir = path.resolve('../client/public');

async function processLogo() {
  console.log('Reading source logo from:', sourceImgPath);

  // 1. Load image and get raw pixel buffer
  const image = sharp(sourceImgPath);
  const metadata = await image.metadata();
  console.log(`Original size: ${metadata.width}x${metadata.height}`);

  const rawBuffer = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = rawBuffer;
  const width = info.width;
  const height = info.height;

  // Create buffers for white transparent and dark transparent
  const whiteData = Buffer.alloc(data.length);
  const darkData = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Invert lightness to calculate opacity (black text = high opacity 255, white bg = 0 opacity)
    const brightness = (r + g + b) / 3;
    const alpha = Math.max(0, Math.min(255, 255 - brightness));

    // For White Logo (used on dark navbar/footer)
    whiteData[i] = 255;     // R
    whiteData[i + 1] = 255; // G
    whiteData[i + 2] = 255; // B
    // Threshold smoothing
    whiteData[i + 3] = alpha > 25 ? alpha : 0;

    // For Dark Logo (used on light backgrounds)
    darkData[i] = 15;     // R
    darkData[i + 1] = 23;  // G
    darkData[i + 2] = 42;  // B
    darkData[i + 3] = alpha > 25 ? alpha : 0;
  }

  // 2. Output trimmed white logo
  const whiteImg = sharp(whiteData, { raw: { width, height, channels: 4 } }).trim();
  const whiteBuffer = await whiteImg.png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'vuela-logo-white.png'), whiteBuffer);
  console.log('Saved vuela-logo-white.png');

  // 3. Output trimmed dark logo
  const darkImg = sharp(darkData, { raw: { width, height, channels: 4 } }).trim();
  const darkBuffer = await darkImg.png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'vuela-logo-dark.png'), darkBuffer);
  console.log('Saved vuela-logo-dark.png');

  // 4. Create Favicon (128x128 with white logo on branded dark purple pill or transparent)
  const trimmedWhite = sharp(whiteBuffer);
  const trimmedMeta = await trimmedWhite.metadata();
  
  // Favicon SVG & PNG with full VUELA wordmark
  const faviconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 13, g: 18, b: 31, alpha: 1 } // #0d121f matching navbar
    }
  })
  .composite([
    {
      input: await sharp(whiteBuffer).resize({ width: 440, fit: 'inside' }).toBuffer(),
      gravity: 'center'
    }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconBuffer);
  console.log('Saved favicon.png and favicon.ico');

  // 5. Create SVG Favicon wrapper
  const base64Favicon = faviconBuffer.toString('base64');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0d121f" />
  <image href="data:image/png;base64,${base64Favicon}" x="0" y="0" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('Saved favicon.svg');

  // 6. Create og-preview.svg
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#110d24"/>
      <stop offset="100%" stop-color="#0d172e"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="950" cy="150" r="300" fill="#7c3aed" opacity="0.12" filter="blur(80px)"/>
  <circle cx="250" cy="450" r="250" fill="#0284c7" opacity="0.1" filter="blur(80px)"/>
  
  <!-- VUELA Wordmark -->
  <g transform="translate(100, 110)">
    <image href="data:image/png;base64,${whiteBuffer.toString('base64')}" width="380" height="110" />
  </g>
  
  <!-- Headline & Subheadline -->
  <text x="100" y="300" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">
    AP &amp; TG Counselling Simulator
  </text>
  <text x="100" y="365" fill="url(#brandGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700">
    College Predictor, Cutoffs &amp; Mock Web Options
  </text>
  
  <text x="100" y="440" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400">
    AP EAPCET • TG EAPCET • TG ICET • TG ECET • TG POLYCET
  </text>
  
  <!-- Bottom URL Pill -->
  <g transform="translate(100, 500)">
    <rect width="320" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.2"/>
    <text x="160" y="33" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" text-anchor="middle">
      🌐 vuelalearn.in
    </text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'og-preview.svg'), ogSvg);
  console.log('Saved og-preview.svg');
}

processLogo().then(() => {
  console.log('All logo assets successfully generated!');
  process.exit(0);
}).catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
