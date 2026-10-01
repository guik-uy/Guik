// Renderiza cada <section class="story"> de historias.html a PNG 1080×1920
// y arma una tira de vista previa con todas juntas.
// Uso: NODE_PATH=$(npm root -g) node render.mjs [--qa]
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const qa = process.argv.includes('--qa');
const out = path.join(dir, qa ? 'qa' : '.');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 2100 }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
await page.goto(pathToFileURL(path.join(dir, 'historias.html')).href + (qa ? '?qa' : ''));
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }
await page.evaluate(() => document.fonts.ready);

// Control de calidad: cada línea de texto real dentro de márgenes (64 px) y zonas seguras de IG
const issues = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('section.story').forEach((sec, i) => {
    const sr = sec.getBoundingClientRect();
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (el.closest('.bg,.ghost,[aria-hidden]')) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const b of r.getClientRects()) {
        const x0 = b.left - sr.left, x1 = b.right - sr.left, y0 = b.top - sr.top, y1 = b.bottom - sr.top;
        const t = n.textContent.trim().slice(0, 28);
        if ((x0 < 63 || x1 > 1017) && !el.closest('[data-optical]')) out.push(`V${i + 1} margen: "${t}" x ${x0.toFixed(0)}–${x1.toFixed(0)}`);
        if (y0 < 250 || y1 > 1620) out.push(`V${i + 1} zona segura: "${t}" y ${y0.toFixed(0)}–${y1.toFixed(0)}`);
      }
    }
    sec.querySelectorAll('*').forEach(el => {
      if (el.closest('.bg')) return;
      const cs = getComputedStyle(el);
      if ((cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1)
        out.push(`V${i + 1} texto cortado: "${el.textContent.trim().slice(0, 30)}"`);
    });
    // solapamientos entre bloques principales
    const blocks = [...sec.children].filter(c => !c.matches('.bg,.ghost,img.sph,.hero') && c.offsetParent !== null);
    for (let a = 0; a < blocks.length; a++) for (let b = a + 1; b < blocks.length; b++) {
      const A = blocks[a].getBoundingClientRect(), B = blocks[b].getBoundingClientRect();
      if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom)
        out.push(`V${i + 1} solapan: .${blocks[a].className} / .${blocks[b].className}`);
    }
  });
  return out;
});
console.log(issues.length ? 'QA:\n  ' + issues.join('\n  ') : 'QA: sin problemas de márgenes, zonas seguras, cortes ni solapamientos');

const stories = await page.$$('section.story');
const files = [];
for (const [i, el] of stories.entries()) {
  const f = path.join(out, `aicia-que-es-v${i + 1}.png`);
  await el.screenshot({ path: f });
  files.push(f);
  console.log('ok', path.relative(dir, f));
}

// Tira de vista previa
if (!qa) {
  const w = 360, h = 640, gap = 28, pad = 48;
  const html = `<!doctype html><body style="margin:0;background:#101018;display:flex;gap:${gap}px;padding:${pad}px;width:max-content">
    ${files.map((f, i) => `<figure style="margin:0;display:flex;flex-direction:column;gap:14px;align-items:flex-start">
      <img src="${pathToFileURL(f).href}" style="width:${w}px;height:${h}px;border-radius:22px;display:block;box-shadow:0 20px 40px -20px #000">
      <figcaption style="font:500 18px/1 system-ui;color:#9a9bb8;letter-spacing:.02em">V${i + 1}</figcaption></figure>`).join('')}
  </body>`;
  const tmp = path.join(dir, '.preview.html');
  fs.writeFileSync(tmp, html);
  const p2 = await browser.newPage({ deviceScaleFactor: 2 });
  await p2.goto(pathToFileURL(tmp).href);
  await p2.waitForLoadState('load');
  await p2.screenshot({ path: path.join(dir, 'aicia-que-es-preview.png'), fullPage: true });
  fs.unlinkSync(tmp);
  console.log('ok aicia-que-es-preview.png');
}
await browser.close();
