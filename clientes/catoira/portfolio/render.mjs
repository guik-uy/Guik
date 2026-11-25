// Imágenes 1920×1080 del proyecto Catoira para el portfolio de Workana (workana.html), al doble y achicadas con lanczos.
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node clientes/catoira/portfolio/render.mjs [id ...]
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../../..'), outDir = path.join(here, 'imagenes');
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/clientes/catoira/portfolio/workana.html`;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base); const all = await page.evaluate(() => window.SLIDE_IDS);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
for (const id of ids) {
  await page.goto(`${base}?s=${id}`); await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
  const qa = await page.evaluate(() => { const o = [];
    document.querySelectorAll('.tx > *').forEach(el => { const r = el.getBoundingClientRect(); if (r.left < 80 || r.right > 960 || r.top < 80 || r.bottom > 1000) o.push(`fuera de margen: ${el.className}`); });
    const t = document.querySelector('.tx').getBoundingClientRect(); let minX = 1e9;
    document.querySelectorAll('.scene > *').forEach(el => { const r = el.getBoundingClientRect(); minX = Math.min(minX, r.left); if (r.top < 40 || r.bottom > 1040 || r.right > 1880) o.push('pieza cerca del borde: ' + el.className + ` ${r.left|0},${r.top|0}–${r.right|0},${r.bottom|0}`); });
    const lede = document.querySelector('.lede').getBoundingClientRect(), title = document.querySelector('.title').getBoundingClientRect();
    if (Math.max(lede.right, title.right) > minX - 40) o.push(`texto pegado a la escena: ${Math.max(lede.right, title.right)|0} vs ${minX|0}`);
    return o; });
  console.log(id, qa.length ? 'QA:\n  ' + qa.join('\n  ') : 'QA: ok');
  const raw = path.join(outDir, `.${id}@2x.png`); await page.screenshot({ path: raw });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', 'scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', path.join(outDir, `catoira-${id}.png`)]); fs.rmSync(raw);
}
await browser.close(); server.close();
