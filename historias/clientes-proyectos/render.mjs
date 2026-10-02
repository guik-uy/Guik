// Renderiza las historias de Clientes y Proyectos (y las portadas de destacadas) a PNG 1080×1920 + vista previa.
// Uso: NODE_PATH=$(npm root -g) node render.mjs [--qa]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const qa = process.argv.includes('--qa');
const htmlFile = 'historias.html';
const out = path.join(dir, qa ? 'qa' : '.');
fs.mkdirSync(out, { recursive: true });

// Servidor local: las máscaras CSS con imágenes necesitan http (no file://)
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 2100 }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + htmlFile + (qa ? '?qa' : ''));
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }
await page.evaluate(() => document.fonts.ready);

// Control de calidad: texto dentro de márgenes y zonas seguras, cortes y solapamientos de texto/UI
const issues = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('section.story').forEach((sec, i) => {
    const sr = sec.getBoundingClientRect();
    const tag = `0${i + 1}`;
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (el.closest('.screen,.sig,[aria-hidden]')) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const b of r.getClientRects()) {
        const x0 = b.left - sr.left, x1 = b.right - sr.left, y0 = b.top - sr.top, y1 = b.bottom - sr.top;
        const t = n.textContent.trim().slice(0, 28);
        if (x0 < 63 || x1 > 1017) out.push(`${tag} margen: "${t}" x ${x0.toFixed(0)}–${x1.toFixed(0)}`);
        if (y0 < 250 || y1 > 1620) out.push(`${tag} zona segura: "${t}" y ${y0.toFixed(0)}–${y1.toFixed(0)}`);
      }
    }
    sec.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if ((cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1 && !el.matches('.screen'))
        out.push(`${tag} texto cortado: "${el.textContent.trim().slice(0, 30)}"`);
    });
    const blocks = [...sec.querySelectorAll(':scope > .tx, :scope > .ui, :scope > .notif, :scope > .toast, :scope > .cta, :scope > .alt, :scope > .hd, :scope > .note')];
    for (let a = 0; a < blocks.length; a++) for (let b = a + 1; b < blocks.length; b++) {
      const A = blocks[a].getBoundingClientRect(), B = blocks[b].getBoundingClientRect();
      if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom)
        out.push(`${tag} solapan: .${blocks[a].className.split(' ')[0]} / .${blocks[b].className.split(' ')[0]}`);
    }
  });
  return out;
});
console.log(issues.length ? 'QA:\n  ' + issues.join('\n  ') : 'QA: sin problemas de márgenes, zonas seguras, cortes ni solapamientos');

const files = [];
for (const [i, el] of (await page.$$('section.story')).entries()) {
  const f = path.join(out, await el.getAttribute('data-file'));
  await el.screenshot({ path: f });
  files.push(f);
  console.log('ok', path.relative(dir, f));
}

if (!qa) {
  const stories = files.filter(f => !path.basename(f).startsWith('portada'));
  const covers = files.filter(f => path.basename(f).startsWith('portada'));
  const w = 360, h = 640;
  const html = `<!doctype html><body style="margin:0;background:#101018;padding:48px;width:max-content;font:500 18px/1 system-ui;color:#9a9bb8">
    <div style="display:flex;gap:28px">${stories.map(f => `<figure style="margin:0;display:flex;flex-direction:column;gap:14px">
      <img src="${path.basename(f)}" style="width:${w}px;height:${h}px;border-radius:22px;display:block;box-shadow:0 20px 40px -20px #000">
      <figcaption>${path.basename(f, '.png').replace('aicia-', '')}</figcaption></figure>`).join('')}</div>
    <div style="display:flex;gap:56px;margin-top:48px;align-items:center">${covers.map(f => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:14px">
      <div style="width:150px;height:150px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #2b2b36,0 0 0 6px #101018,0 0 0 7.5px #6b6b7a"><img src="${path.basename(f)}" style="width:150px;height:267px;object-fit:cover;margin-top:-58px;display:block"></div>
      <figcaption>${path.basename(f, '.png').replace('portada-destacada-', '')}</figcaption></figure>`).join('')}</div>
  </body>`;
  fs.writeFileSync(path.join(dir, '.preview.html'), html);
  const p2 = await browser.newPage({ deviceScaleFactor: 2 });
  await p2.goto(base + '.preview.html');
  await p2.waitForLoadState('load');
  await p2.screenshot({ path: path.join(dir, 'vista-previa.png'), fullPage: true });
  fs.unlinkSync(path.join(dir, '.preview.html'));
  console.log('ok vista-previa.png');
}
await browser.close();
server.close();
