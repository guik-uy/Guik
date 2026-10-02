// Graba las historias en video de historias.html (las <section data-video>).
// 1) El navegador calcula UNA vez las placas fijas: lo de abajo de la pantalla (foto + efectos), lo de arriba
//    (texto, viñeta), la máscara y el brillo de la pantalla, y la barra del navegador.
// 2) ffmpeg arma cada cuadro: barra + cuadro de la grabación → perspectiva a las 4 esquinas → resplandor → placas → grano.
// Antes hay que generar los cuadros de la grabación en data-frames (ver CLAUDE.md, "Historias en video").
// Uso: NODE_PATH=$(npm root -g) node render-video.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 2100 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[error]', e.message));
await page.goto(base + 'historias.html');
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);

const files = await page.$$eval('section[data-video]', s => s.map(el => ({ file: el.dataset.video, frames: el.dataset.frames })));
for (const v of files) {
  const frames = fs.existsSync(path.join(dir, v.frames)) ? fs.readdirSync(path.join(dir, v.frames)).filter(f => f.endsWith('.jpg')).sort() : [];
  if (!frames.length) { console.log('sin cuadros en', v.frames, '→ se saltea', v.file); continue; }
  const name = path.basename(v.file, '.mp4');
  const P = path.join(dir, '.video-out', 'placas', name); fs.mkdirSync(P, { recursive: true });
  const sel = `section[data-video="${v.file}"]`;
  const el = await page.$(sel);
  const vis = (q, show) => page.evaluate(({ sel, q, show }) => document.querySelector(sel).querySelectorAll(q).forEach(e => { e.style.visibility = show ? '' : 'hidden'; }), { sel, q, show });
  const bg = t => page.evaluate(({ sel, t }) => { for (const e of [document.documentElement, document.body, document.querySelector(sel)]) e.style.background = t; }, { sel, t });
  const over = '.vignette,.basefade,.sig,.tx,.cl-logo';

  // Placa de abajo: fondo + foto + efectos, con la pantalla apagada (la foto ya la tiene en negro)
  await vis('.lap-scr,.grain,' + over, false);
  await el.screenshot({ path: path.join(P, 'abajo.png') });
  await vis('.lap-scr,.grain,' + over, true);

  // Placa de arriba (transparente): texto, logo, viñeta y degradé inferior
  await vis('.stage,.grid,.lap,.grain', false); await bg('transparent');
  await el.screenshot({ path: path.join(P, 'arriba.png'), omitBackground: true });

  // Brillo del vidrio (transparente) y máscara de la pantalla (blanco = pantalla)
  await vis(over, false); await vis('.lap', true);
  await vis('.lap > .subj,.lap > .fx,.lap-scr.bloom,.site', false);
  await el.screenshot({ path: path.join(P, 'brillo.png'), omitBackground: true });
  await vis('.glare', false); await vis('.site', true);
  await page.evaluate(sel => { const s = document.querySelector(sel + ' .lap-scr .site'); s.dataset.bg = s.style.background; s.style.background = '#fff'; [...s.children].forEach(c => { c.style.visibility = 'hidden'; }); }, sel);
  await bg('#000');
  await el.screenshot({ path: path.join(P, 'mascara.png') });

  // Barra del navegador sin perspectiva (1512 × 64)
  const geo = await page.evaluate(sel => {
    const sec = document.querySelector(sel), lap = sec.querySelector('.lap'), site = sec.querySelector('.lap-scr .site');
    const tmp = document.createElement('div'); tmp.className = 'site web'; tmp.id = 'barra-tmp';
    tmp.style.cssText = 'position:fixed;left:0;top:0;width:1512px;height:64px;transform:none;z-index:999;border-radius:0';
    tmp.append(site.querySelector('.chrome').cloneNode(true)); document.body.append(tmp);
    tmp.querySelector('.chrome').style.visibility = '';
    const k = lap.clientWidth / +lap.dataset.w, L = lap.offsetLeft, T = lap.offsetTop;
    const q = lap.dataset.quad.split(' ').map(p => p.split(',').map(Number)).map(([x, y]) => [L + x * k, T + y * k]);
    return { q, siteW: site.offsetWidth, siteH: site.offsetHeight, barH: site.querySelector('.chrome').offsetHeight };
  }, sel);
  await page.setViewportSize({ width: 1512, height: 2100 });
  await (await page.$('#barra-tmp')).screenshot({ path: path.join(P, 'barra.png') });
  await page.setViewportSize({ width: 1200, height: 2100 });
  await page.evaluate(() => document.getElementById('barra-tmp').remove());
  await page.reload(); await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });

  // Armado con ffmpeg
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = geo.q; // TL TR BR BL
  const persp = `perspective=${x0}:${y0}:${x1}:${y1}:${x3}:${y3}:${x2}:${y2}:sense=destination:interpolation=cubic`;
  const frameH = geo.siteH - geo.barH;
  const graph = [
    `[0:v]scale=${geo.siteW}:${frameH}:flags=lanczos[f]`,
    `[1:v][f]vstack,scale=1080:1920:flags=lanczos,${persp},gblur=sigma=0.5,eq=saturation=0.96,format=gbrp[w]`,
    `[3:v]format=gray[m]`,
    `[w][m]alphamerge,split[scr][scr2]`,
    `[2:v]format=gbrp[ab]`,
    `[ab][scr]overlay=format=gbrp[b1]`,
    // resplandor de la pantalla: la pantalla desenfocada y sumada en modo "screen"
    `color=c=black:s=1080x1920,format=gbrp[neg]`,
    `[neg][scr2]overlay=format=gbrp[sb]`,
    `[sb]gblur=sigma=16,format=gbrp[bl]`,
    `[b1][bl]blend=all_mode=screen:all_opacity=0.2,format=gbrp[b2]`,
    `[4:v]format=rgba[br]`, `[b2][br]overlay=format=gbrp[b3]`,
    `[5:v]format=rgba[ar]`, `[b3][ar]overlay=format=gbrp[b4]`,
    `[b4]noise=alls=5:allf=t+u,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]`,
  ].join(';');
  const out = path.join(dir, v.file);
  const t0 = Date.now();
  execFileSync('ffmpeg', ['-v', 'error', '-y',
    '-framerate', String(FPS), '-i', path.join(dir, v.frames, '%04d.jpg'),
    '-loop', '1', '-i', path.join(P, 'barra.png'),
    '-loop', '1', '-i', path.join(P, 'abajo.png'),
    '-loop', '1', '-i', path.join(P, 'mascara.png'),
    '-loop', '1', '-i', path.join(P, 'brillo.png'),
    '-loop', '1', '-i', path.join(P, 'arriba.png'),
    '-filter_complex', graph, '-map', '[out]', '-frames:v', String(frames.length), '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`ok ${v.file} (${frames.length} cuadros, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
server.close();
