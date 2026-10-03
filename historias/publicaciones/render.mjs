// Renderiza las publicaciones del feed de Aicia a PNG 1080×1350 + vista previa del feed.
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
const out = path.join(dir, qa ? 'qa' : '.');
fs.mkdirSync(out, { recursive: true });

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + 'publicaciones.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 60000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }

// Control: texto dentro de 80–1000 px (la grilla del perfil recorta los costados a 3:4) y lejos de los bordes de arriba y abajo
const issues = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('section.post').forEach((sec, i) => {
    const sr = sec.getBoundingClientRect(), tag = `0${i + 1}`;
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT); let n; // la firma de abajo va fuera del control, como en las historias
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim() || n.parentElement.closest('.sig')) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const b of r.getClientRects()) {
        const x0 = b.left - sr.left, x1 = b.right - sr.left, y0 = b.top - sr.top, y1 = b.bottom - sr.top, t = n.textContent.trim().slice(0, 28);
        if (x0 < 79 || x1 > 1001) out.push(`${tag} margen: "${t}" x ${x0.toFixed(0)}–${x1.toFixed(0)}`);
        if (y0 < 56 || y1 > 1290) out.push(`${tag} borde: "${t}" y ${y0.toFixed(0)}–${y1.toFixed(0)}`);
      }
    }
    const blocks = [...sec.querySelectorAll(':scope > .tx, :scope > .pill, :scope > .mark')];
    for (let a = 0; a < blocks.length; a++) for (let b = a + 1; b < blocks.length; b++) {
      const A = blocks[a].getBoundingClientRect(), B = blocks[b].getBoundingClientRect();
      if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) out.push(`${tag} solapan: .${blocks[a].getAttribute('class').split(' ')[0]} / .${blocks[b].getAttribute('class').split(' ')[0]}`);
    }
  });
  return out;
});
console.log(issues.length ? 'QA:\n  ' + issues.join('\n  ') : 'QA: sin problemas de márgenes ni solapamientos');

const files = [];
for (const el of await page.$$('section.post')) {
  const f = path.join(out, await el.getAttribute('data-file'));
  await el.screenshot({ path: f });
  files.push(f);
  console.log('ok', path.relative(dir, f));
}

if (!qa) {
  // Vista previa: el feed (4:5) arriba y la grilla del perfil (recorte 3:4) abajo
  const img = (f, w, h, crop) => `<div style="width:${w}px;height:${h}px;overflow:hidden;background:#fff"><img src="${path.basename(f)}" style="display:block;height:${h}px;${crop ? `margin-left:${-(h * .8 - w) / 2}px` : `width:${w}px`}"></div>`;
  const html = `<!doctype html><body style="margin:0;background:#101018;padding:48px;width:max-content;font:500 18px/1 system-ui;color:#9a9bb8">
    <div style="display:flex;gap:28px">${files.map(f => `<figure style="margin:0;display:flex;flex-direction:column;gap:14px"><div style="border-radius:14px;overflow:hidden;box-shadow:0 20px 40px -20px #000">${img(f, 432, 540)}</div><figcaption>${path.basename(f, '.png').replace('aicia-', '')}</figcaption></figure>`).join('')}</div>
    <div style="display:flex;gap:3px;margin-top:48px">${files.map(f => img(f, 300, 400, true)).join('')}</div>
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
