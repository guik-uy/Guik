// Renderiza el logo de perfil de Aicia (1080×1080, dibujado a 2160 y achicado) + vista previa como se ve en el perfil de Instagram.
// Uso: NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1800, height: 1300 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + 'logo.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('Error en la página:', err); process.exit(1); }

const files = [];
for (const el of await page.$$('section.sq')) {
  const f = await el.getAttribute('data-file');
  // Se dibuja al doble (2160) y se achica a 1080 con lanczos: bordes más suaves y el tamaño que pide Instagram
  const tmp = path.join(dir, '.' + f);
  const [w, h] = ((await el.getAttribute('data-size')) || '1080x1080').split('x');
  const transp = (await el.getAttribute('data-transparent')) !== null; // sin fondo (PNG con transparencia)
  if (transp) await page.evaluate(() => { document.documentElement.style.background = document.body.style.background = 'transparent'; });
  await el.screenshot({ path: tmp, omitBackground: transp });
  if (transp) await page.evaluate(() => { document.documentElement.style.background = document.body.style.background = ''; });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `scale=${w}:${h}:flags=lanczos+accurate_rnd+full_chroma_int`, path.join(dir, f)]);
  fs.unlinkSync(tmp);
  if (transp) { console.log('ok', f); continue; } // no va a la vista previa en círculo
  files.push(f);
  console.log('ok', f);
}

// Vista previa: cuadrado y círculo del perfil (grande y a tamaño real)
const circ = (f, s) => `<img src="${f}" style="width:${s}px;height:${s}px;border-radius:50%;display:block;box-shadow:0 0 0 ${Math.max(1, s * .012)}px #3a3a44">`;
const html = `<!doctype html><body style="margin:0;background:#000;padding:48px;width:max-content;display:flex;flex-direction:column;gap:48px;font:500 16px/1 system-ui;color:#9a9bb8">
  ${files.map(f => `<div style="display:flex;gap:40px;align-items:center"><img src="${f}" style="width:420px;height:420px;display:block;border-radius:8px">${circ(f, 300)}${circ(f, 150)}${circ(f, 110)}${circ(f, 77)}${circ(f, 56)}${circ(f, 32)}<span>${f.replace('.png', '')}</span></div>`).join('')}
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
