// Imágenes 1920×1080 de los proyectos para LinkedIn (versiones fijas de los videos de Bs.As. Top y FC Barber Shop).
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node aicia-linkedin/render-proyectos.mjs [id ...]
// Sin ids, saca todas. Cada una se dibuja al doble y se achica con lanczos. Necesita historias/clientes-proyectos/.frames/bsas3
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.dirname(here), outDir = path.join(here, 'proyectos');
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/aicia-linkedin/proyectos.html`;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base);
const all = await page.evaluate(() => window.SLIDES);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
for (const id of ids) {
  if (!all.includes(id)) { console.log('no existe:', id); continue; }
  await page.goto(`${base}?s=${id}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error);
  if (err) { console.log(id, 'ERROR', err); continue; }
  // Control: texto dentro de los márgenes (80 px), fuentes cargadas, título que no se pisa con la escena
  const qa = await page.evaluate(() => {
    const o = [];
    for (const f of ['600 108px Geist', 'italic 124px "Instrument Serif"']) if (!document.fonts.check(f, '¿áéíóúñ')) o.push('fuente sin cargar: ' + f);
    document.querySelectorAll('.tx > *, .sig').forEach(el => { const rg = document.createRange(); rg.selectNodeContents(el); const r = el.matches('.sig') ? rg.getBoundingClientRect() : el.getBoundingClientRect(); if (r.left < 80 || r.right > 1840 || r.top < 80 || r.bottom > 1000) o.push(`fuera de margen: ${el.className} ${r.left|0},${r.top|0}–${r.right|0},${r.bottom|0}`); });
    const t = document.querySelector('.title').getBoundingClientRect();
    return { o, title: [Math.round(t.left), Math.round(t.right)] };
  });
  console.log(id, qa.o.length ? 'QA:\n  ' + qa.o.join('\n  ') : 'QA: ok', '· título x', qa.title.join('–'));
  const raw = path.join(outDir, `.${id}@2x.png`);
  await page.screenshot({ path: raw });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', 'scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', path.join(outDir, `${id}.png`)]);
  fs.rmSync(raw);
}
await browser.close(); server.close();
