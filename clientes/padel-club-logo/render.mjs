// Propuestas de logo del club de pádel: hoja con las 3 opciones (logo.html).
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node clientes/padel-club-logo/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', '..');
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1680, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/clientes/padel-club-logo/logo.html`);
await page.waitForFunction(() => window.__ready);
await page.screenshot({ path: path.join(here, 'propuestas.png'), fullPage: true });
console.log('ok propuestas.png');
await browser.close(); server.close();
