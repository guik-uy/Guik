// Capturas de la web de Aicia (escritorio 1440 y celular 390) + control de desbordes.
// Uso: NODE_PATH=$(npm root -g) node capturas.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'capturas');
fs.mkdirSync(out, { recursive: true });

const types = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

for (const [name, w, h, dpr] of [['escritorio', 1440, 900, 1], ['celular', 390, 844, 2]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  page.on('pageerror', e => console.log('[error]', e.message));
  page.on('console', m => m.type() === 'error' && console.log('[console]', m.text()));
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  // carga las imágenes diferidas y espera el chat animado
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } scrollTo({ top: 0, behavior: 'instant' }); await Promise.all([...document.images].filter(i => i.offsetParent).map(i => i.decode().catch(() => {}))); });
  await page.waitForTimeout(6500);
  const qa = await page.evaluate(() => {
    const out = [], W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > W) out.push(`desborde horizontal: ${document.documentElement.scrollWidth} > ${W}`);
    document.querySelectorAll('h1,h2,h3,p,li,b,span,a').forEach(el => {
      if (el.closest('[aria-hidden="true"]')) return;
      const r = el.getBoundingClientRect();
      if (r.width && (r.left < 0 || r.right > W + .5)) out.push(`fuera de pantalla: <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 30)}" ${r.left.toFixed(0)}–${r.right.toFixed(0)}`);
    });
    [...document.images].filter(i => i.offsetParent).forEach(i => { if (!i.complete || !i.naturalWidth) out.push('imagen sin cargar: ' + i.getAttribute('src')); });
    return out;
  });
  console.log(name, qa.length ? 'QA:\n  ' + qa.join('\n  ') : 'QA: ok');
  await page.screenshot({ path: path.join(out, `${name}-inicio.png`) });
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  console.log('ok', name);
  await page.close();
}
await browser.close();
server.close();
