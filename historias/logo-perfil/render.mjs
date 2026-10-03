// Renderiza el logo de perfil de Aicia (2160×2160) + vista previa como se ve en el perfil de Instagram.
// Uso: NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1300, height: 1300 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + 'logo.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }

const files = [];
for (const el of await page.$$('section.sq')) {
  const f = await el.getAttribute('data-file');
  await el.screenshot({ path: path.join(dir, f) });
  files.push(f);
  console.log('ok', f);
}

// Vista previa: cuadrado y círculo del perfil (grande y a tamaño real)
const circ = (f, s) => `<img src="${f}" style="width:${s}px;height:${s}px;border-radius:50%;display:block;box-shadow:0 0 0 ${Math.max(1, s * .012)}px #3a3a44">`;
const html = `<!doctype html><body style="margin:0;background:#000;padding:48px;width:max-content;display:flex;flex-direction:column;gap:48px;font:500 16px/1 system-ui;color:#9a9bb8">
  ${files.map(f => `<div style="display:flex;gap:40px;align-items:center"><img src="${f}" style="width:420px;height:420px;display:block;border-radius:8px">${circ(f, 300)}${circ(f, 150)}${circ(f, 77)}${circ(f, 32)}<span>${f.replace('.png', '')}</span></div>`).join('')}
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
