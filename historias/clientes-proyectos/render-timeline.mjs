// Graba una historia en video armada como línea de tiempo (una página con window.renderAt(t)).
// 1) "Hornea" los dispositivos con sus efectos de integración a 2x (una sola vez) → .video-out/bake/
// 2) Recorre el tiempo cuadro por cuadro, captura y arma el MP4 (grano y color bt709 con ffmpeg).
// También guarda el PNG estático de la historia (instante --poster, por defecto 2 s).
// Uso: NODE_PATH=$(npm root -g) node render-timeline.mjs video-bsas.html [--dur 16] [--fps 30] [--poster 2] [--test 1,3.6,6]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const html = process.argv.slice(2).find(a => a.endsWith('.html')) || 'video-bsas.html';
const DUR = +arg('dur', 22), FPS = +arg('fps', 30), POSTER = +arg('poster', 2), TEST = arg('test', '');

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const open = async (q, dpr = 1, vp = { width: 1080, height: 1920 }) => {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: dpr });
  page.on('pageerror', e => console.log('[error]', e.message));
  await page.goto(base + html + q);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error); if (err) { console.error(err); process.exit(1); }
  return page;
};

// 1) Horneado de dispositivos
const bake = path.join(dir, '.video-out', 'bake'); fs.mkdirSync(bake, { recursive: true });
{
  const p = await open('?t=0', 2, { width: 1700, height: 1500 });
  const ids = await p.$$eval('[data-bake]', els => els.map(e => e.id));
  await p.evaluate(() => { document.documentElement.style.background = document.body.style.background = 'transparent'; const s = document.querySelector('.story'); s.style.background = 'transparent'; s.style.overflow = 'visible'; s.style.width = '1700px'; s.style.height = '1500px';
    s.querySelectorAll(':scope > *').forEach(e => { if (!e.matches('[data-bake]')) e.style.visibility = 'hidden'; }); });
  for (const id of ids) {
    await p.evaluate(id => document.querySelectorAll('[data-bake]').forEach(e => { e.style.visibility = e.id === id ? '' : 'hidden'; e.style.transform = 'none'; e.style.opacity = 1; e.style.left = '0px'; e.style.top = '0px'; }), id);
    const name = await p.$eval('#' + id, e => e.dataset.bake);
    await (await p.$('#' + id)).screenshot({ path: path.join(bake, name + '.png'), omitBackground: true });
  }
  await p.close();
  console.log('dispositivos horneados:', ids.join(', '));
}

// 2) Cuadros
const page = await open('?baked&t=0');
const story = await page.$('.story');
const meta = await page.$eval('.story', s => ({ png: s.dataset.file, mp4: s.dataset.video }));
const shot = async (t, file, type = 'jpeg') => { await page.evaluate(t => window.renderAt(t), t); await story.screenshot(type === 'png' ? { path: file } : { path: file, type: 'jpeg', quality: 95 }); };

if (TEST) {
  const out = path.join(dir, '.video-out', 'test'); fs.mkdirSync(out, { recursive: true });
  for (const t of TEST.split(',').map(Number)) await shot(t, path.join(out, `t${t.toFixed(2)}.jpg`));
  console.log('pruebas en', path.relative(dir, out));
} else {
  await shot(POSTER, path.join(dir, meta.png), 'png');
  console.log('ok', meta.png);
  const out = path.join(dir, '.video-out', path.basename(meta.mp4, '.mp4'));
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const dur = +arg('dur', 0) || await page.evaluate(() => window.DUR) || DUR;
  const N = Math.round(dur * FPS), t0 = Date.now();
  for (let n = 0; n < N; n++) {
    await shot(n / FPS, path.join(out, String(n + 1).padStart(4, '0') + '.jpg'));
    if (n % 60 === 0) console.log(`cuadro ${n + 1}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(out, '%04d.jpg'),
    '-vf', 'format=gbrp,noise=alls=5:allf=t+u,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-movflags', '+faststart', path.join(dir, meta.mp4)], { stdio: 'inherit' });
  console.log(`ok ${meta.mp4} (${N} cuadros, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
server.close();
