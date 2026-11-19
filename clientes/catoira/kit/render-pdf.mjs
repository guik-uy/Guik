// PDF del kit (A4) desde kit.html, con control de páginas desbordadas y capturas para revisar.
// Uso: node clientes/catoira/kit/render-pdf.mjs [--capturas]  → kit/kit-presencia-digital-catoira.pdf (+ .capturas/pag-NN.png)
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', '..', '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1.5 });
const faltan = []; page.on('response', r => { if (r.status() >= 400) faltan.push(r.url()); });
await page.goto(`http://127.0.0.1:${server.address().port}/clientes/catoira/kit/kit.html`);
await page.waitForFunction(() => document.body.dataset.ready); await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
const qa = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
  const r = p.getBoundingClientRect(), lim = r.bottom - 13 * 3.78; let max = 0;
  p.querySelectorAll('*').forEach(e => { if (getComputedStyle(e).position === 'absolute') return; if (e.closest('[style*="position:absolute"]')) return; const b = e.getBoundingClientRect(); if (b.height) max = Math.max(max, b.bottom); });
  return max > lim ? `página ${i + 1}: se pasa ${Math.round((max - lim) / 3.78)} mm` : null;
}).filter(Boolean));
console.log(qa.length ? 'QA:\n  ' + qa.join('\n  ') : 'QA: ninguna página se desborda');
if (faltan.length) console.log('Archivos que no cargaron:\n  ' + faltan.join('\n  '));
if (process.argv.includes('--capturas')) {
  const dir = path.join(here, '.capturas'); fs.mkdirSync(dir, { recursive: true });
  const ps = await page.$$('.page'); for (let i = 0; i < ps.length; i++) await ps[i].screenshot({ path: path.join(dir, `pag-${String(i + 1).padStart(2, '0')}.png`) });
}
await page.emulateMedia({ media: 'print' });
const out = path.join(here, 'kit-presencia-digital-catoira.pdf');
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
console.log('ok', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
await browser.close(); server.close();
