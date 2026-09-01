import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '..');
const distDir = path.resolve(clientDir, 'dist');

const ROUTES = [
  '/',
  '/ap-eapcet',
  '/exams/ap-eapcet/predictor',
  '/exams/ap-eapcet/create-web-options',
  '/exams/ap-eapcet/mock-counselling',
  '/ap-eapcet/allotments',
  '/ap-eapcet/compare',
  '/ap-eapcet/documents',
  '/tg-eapcet',
  '/exams/tg-eapcet/marks-vs-rank',
  '/exams/tg-eapcet/predictor',
  '/exams/tg-eapcet/create-web-options',
  '/exams/tg-eapcet/mock-counselling',
  '/tg-eapcet/allotments',
  '/tg-eapcet/compare',
  '/tg-eapcet/documents',
  '/tg-icet',
  '/exams/tg-icet/marks-vs-rank',
  '/exams/tg-icet/predictor',
  '/exams/tg-icet/create-web-options',
  '/exams/tg-icet/mock-counselling',
  '/tg-icet/allotments',
  '/tg-icet/compare',
  '/tg-icet/documents',
  '/tg-ecet',
  '/exams/tg-ecet/predictor',
  '/exams/tg-ecet/create-web-options',
  '/exams/tg-ecet/mock-counselling',
  '/tg-ecet/allotments',
  '/tg-ecet/compare',
  '/tg-ecet/documents',
  '/tg-polycet',
  '/exams/tg-polycet/predictor',
  '/exams/tg-polycet/create-web-options',
  '/exams/tg-polycet/mock-counselling',
  '/tg-polycet/allotments',
  '/tg-polycet/compare',
  '/tg-polycet/documents',
  '/tg-pgecet',
  '/tg-pgecet/predictor',
  '/tg-pgecet/allotments',
  '/tg-pgecet/compare',
  '/tg-pgecet/documents',
  '/kcet/allotments',
  '/colleges',
  '/compare',
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

function createStaticServer(port = 4173) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      let filePath = path.join(distDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (err) {
        res.writeHead(500);
        res.end(err.message);
      }
    });

    server.listen(port, () => resolve(server));
  });
}

async function prerender() {
  console.log('🚀 Starting Static Site Prerendering for SEO crawlers...');
  const port = 4173;
  const server = await createStaticServer(port);
  console.log(`📡 Local preview server running on port ${port}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let count = 0;
  for (const route of ROUTES) {
    const url = `http://localhost:${port}${route}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      
      // Wait for React lazy suspense chunk to resolve and render actual page content
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          if (!root) return false;
          // Check that we have rendered real content beyond the fallback pulse
          const hasHeadings = document.querySelector('h1, h2, main');
          const hasText = root.innerText && root.innerText.length > 200;
          return hasHeadings && hasText;
        },
        { timeout: 5000 }
      ).catch(() => {});

      // Short 300ms grace period for dynamic SEO title and schemas to mount
      await new Promise((r) => setTimeout(r, 300));

      const html = await page.content();

      // Determine destination file
      let targetFile;
      if (route === '/') {
        targetFile = path.join(distDir, 'index.html');
      } else {
        const routeDir = path.join(distDir, route.replace(/^\//, ''));
        fs.mkdirSync(routeDir, { recursive: true });
        targetFile = path.join(routeDir, 'index.html');
      }

      fs.writeFileSync(targetFile, html, 'utf-8');
      count++;
      console.log(`[${count}/${ROUTES.length}] ✅ Prerendered: ${route} -> ${path.relative(distDir, targetFile)}`);
    } catch (err) {
      console.warn(`[⚠️ Failed to prerender ${route}]:`, err.message);
    }
  }

  await browser.close();
  server.close();
  console.log(`\n🎉 Successfully pre-rendered ${count} pages with full static HTML for Googlebot!`);
}

prerender().catch((err) => {
  console.error('Fatal Prerender Error:', err);
  process.exit(1);
});
