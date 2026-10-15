// Logo de Aicia en la máxima calidad: el de perfil a 4096×4096 (dibujado a 4320 y achicado con lanczos), el símbolo sin
// fondo a 4096×4096 y el símbolo en SVG (vectorial, ya está en hd/). Uso: NODE_PATH=$(npm root -g) node exportar-hd.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
import { execFileSync } from 'node:child_process';

const { chromium } = createRequire(import.meta.url)('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url)), hd = path.join(dir, 'hd');
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);

// 1) Logo de perfil (con su fondo), igual al aprobado pero a 4096
const page = await browser.newPage({ viewport: { width: 1800, height: 1300 }, deviceScaleFactor: 4 });
await page.goto(base + 'logo.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
const tmp = path.join(hd, '.perfil@4x.png');
await (await page.$('section[data-file="aicia-logo-perfil.png"]')).screenshot({ path: tmp });
ff('-i', tmp, '-vf', 'scale=4096:4096:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', path.join(hd, 'aicia-logo-perfil-4096.png'));
fs.rmSync(tmp); await page.close();

// 2) Símbolo sin fondo (PNG transparente) desde el SVG
const p2 = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 4 });
await p2.setContent(`<html style="background:transparent"><body style="margin:0;background:transparent"><img src="${base}hd/aicia-logo-simbolo.svg" style="display:block;width:1024px;height:1024px"></body></html>`);
await p2.waitForLoadState('load');
await p2.screenshot({ path: path.join(hd, 'aicia-logo-simbolo-4096.png'), omitBackground: true });
await browser.close(); server.close();
for (const f of fs.readdirSync(hd)) console.log('ok', f, (fs.statSync(path.join(hd, f)).size / 1e6).toFixed(2) + ' MB');
