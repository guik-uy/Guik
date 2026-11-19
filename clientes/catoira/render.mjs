// Render de las piezas de Catoira: sirve el repo en local, saca cada <section data-file> al doble y la achica con lanczos.
// Uso: node clientes/catoira/render.mjs <html relativo a clientes/catoira> [--rapido]   (--rapido: 1x, sin achicar)
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', '..');
const args = process.argv.slice(2), rapido = args.includes('--rapido'), html = args.find(a => !a.startsWith('--'));
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const rel = path.relative(root, path.join(here, html)).split(path.sep).join('/'), outDir = path.dirname(path.join(here, html));
const browser = await chromium.launch(); const dsf = rapido ? 1 : 2;
const page = await browser.newPage({ viewport: { width: 2200, height: 2000 }, deviceScaleFactor: dsf });
await page.goto(`http://127.0.0.1:${server.address().port}/${rel}`); await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => !document.querySelector('[data-sym]') || document.body.dataset.ready, null, { timeout: 10000 });
const secs = await page.$$('section[data-file]');
for (const s of secs) {
  const file = await s.getAttribute('data-file'), { width: w, height: h } = await s.boundingBox(), out = path.join(outDir, file);
  if (rapido) { await s.screenshot({ path: out }); }
  else { const raw = out + '.raw.png'; await s.screenshot({ path: raw });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', `scale=${Math.round(w)}:${Math.round(h)}:flags=lanczos+accurate_rnd+full_chroma_int`, '-pix_fmt', 'rgb24', out]); fs.rmSync(raw); }
  console.log('ok', file, `${Math.round(w)}×${Math.round(h)}`);
}
await browser.close(); server.close();
