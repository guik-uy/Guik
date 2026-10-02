// Renderiza las portadas de las destacadas en cuadrado (2160×2160) + vista previa a tamaño real de Instagram.
// Uso: NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(dir); // historias/ (las fuentes están en ../clientes-proyectos)

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/portadas-destacadas/`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + 'portadas.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }

const files = [];
for (const el of await page.$$('section.sq')) {
  const f = path.join(dir, await el.getAttribute('data-file'));
  await el.screenshot({ path: f });
  files.push(path.basename(f));
  console.log('ok', path.basename(f));
}

// Vista previa: cuadrados + círculos como se ven en el perfil (grande y tamaño real)
const ring = s => `width:${s}px;height:${s}px;border-radius:50%;padding:${s * .045}px;background:#0f0f14;box-shadow:0 0 0 ${Math.max(1, s * .012)}px #3a3a44`;
const row = s => `<div style="display:flex;gap:${s * .45}px;align-items:flex-start">${files.map(f => `<div style="display:flex;flex-direction:column;align-items:center;gap:${s * .1}px">
  <div style="${ring(s)}"><img src="${f}" style="width:100%;height:100%;border-radius:50%;display:block"></div>
  <span style="font:400 ${Math.max(11, s * .17)}px/1 system-ui;color:#e8e8ee">${f.replace('portada-', '').replace('.png', '').replace(/^./, c => c.toUpperCase())}</span></div>`).join('')}</div>`;
const html = `<!doctype html><body style="margin:0;background:#000;padding:48px;width:max-content;display:flex;flex-direction:column;gap:56px">
  <div style="display:flex;gap:28px">${files.map(f => `<img src="${f}" style="width:360px;height:360px;display:block;border-radius:8px">`).join('')}</div>
  ${row(150)}
  ${row(64)}
</body>`;
fs.writeFileSync(path.join(dir, '.preview.html'), html);
const p2 = await browser.newPage({ deviceScaleFactor: 2 });
await p2.goto(base + '.preview.html');
await p2.waitForLoadState('load');
await p2.screenshot({ path: path.join(dir, 'vista-previa.png'), fullPage: true });
fs.unlinkSync(path.join(dir, '.preview.html'));
console.log('ok vista-previa.png');
await browser.close();
server.close();
