// Graba una historia en video armada como línea de tiempo (una página con window.renderAt(t)).
// 1) "Hornea" los dispositivos con sus efectos de integración a 2x (una sola vez) → .video-out/bake/
// 2) Recorre el tiempo cuadro por cuadro, captura y arma el MP4 (grano y color bt709 con ffmpeg).
// También guarda el PNG estático de la historia (instante --poster, por defecto 2 s).
// Uso: NODE_PATH=$(npm root -g) node render-timeline.mjs video-bsas.html [--fresh] [--ss 2] [--sub 4] [--fps 30] [--poster 2] [--test 1,3.6,6] [--crf 12] [--sharp 0.35]
// Sin --fresh, si los cuadros ya están, solo vuelve a codificar el MP4 (unos minutos).
// Se puede cortar y volver a correr: retoma desde el último cuadro (--fresh empieza de cero).
// --demo: borrador rápido para ir corrigiendo (sin doble resolución ni desenfoque de movimiento, 540×960, liviano).
//   Sale en .video-out/<nombre>-demo.mp4 y no toca el MP4 ni el PNG finales. Tarda unos minutos en vez de ~45.
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

// 2) Cuadros, dibujados al doble de resolución (texto y bordes más limpios; ffmpeg achica con lanczos al final)
const DEMO = process.argv.includes('--demo');
const SS = DEMO ? 1 : +arg('ss', 2), SUB = DEMO ? 1 : +arg('sub', 4), SHUTTER = .5; // escala · instantes por cuadro con desenfoque · obturador (fracción del cuadro)
const page = await open('?baked&t=0', SS);
const story = await page.$('.story');
const meta = await page.$eval('.story', s => ({ png: s.dataset.file, mp4: s.dataset.video }));
const MB = await page.evaluate(() => window.MBLUR || []);
const shot = async (t, file, type = 'jpeg') => { await page.evaluate(t => window.renderAt(t), t); await story.screenshot(type === 'png' ? { path: file } : { path: file, type: 'jpeg', quality: 93 }); };
// Desenfoque de movimiento real: en las ventanas MBLUR el cuadro es el promedio de SUB instantes dentro del obturador
const frame = async (t, file, tmp) => {
  if (DEMO || SUB < 2 || !MB.some(([a, b]) => t >= a && t <= b)) return shot(t, file);
  const subs = [];
  for (let j = 0; j < SUB; j++) { const f = path.join(tmp, `s${j}.jpg`); await shot(t + ((j + .5) / SUB - .5) * SHUTTER / FPS, f); subs.push('-i', f); }
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...subs, '-filter_complex', `mix=inputs=${SUB}`, '-q:v', '2', file]);
};

if (TEST) {
  const out = path.join(dir, '.video-out', 'test'); fs.mkdirSync(out, { recursive: true });
  for (const t of TEST.split(',').map(Number)) await frame(t, path.join(out, `t${t.toFixed(2)}.jpg`), out);
  console.log('pruebas en', path.relative(dir, out));
} else if (DEMO) {
  const name = path.basename(meta.mp4, '.mp4') + '-demo', out = path.join(dir, '.video-out', name);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const dur = await page.evaluate(() => window.DUR) || DUR, N = Math.round(dur * FPS), t0 = Date.now();
  for (let n = 0; n < N; n++) await shot(n / FPS, path.join(out, String(n + 1).padStart(4, '0') + '.jpg'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(out, '%04d.jpg'), '-vf', 'scale=540:960:flags=lanczos,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-movflags', '+faststart', path.join(dir, '.video-out', name + '.mp4')]);
  fs.rmSync(out, { recursive: true, force: true });
  console.log(`ok .video-out/${name}.mp4 (${N} cuadros, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
} else {
  const tmpPng = path.join(dir, '.video-out', 'poster.png');
  await shot(POSTER, tmpPng, 'png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmpPng, '-vf', 'scale=1080:1920:flags=lanczos', path.join(dir, meta.png)]);
  console.log('ok', meta.png);
  const out = path.join(dir, '.video-out', path.basename(meta.mp4, '.mp4')), tmp = path.join(dir, '.video-out', 'sub');
  if (process.argv.includes('--fresh')) fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });
  const dur = +arg('dur', 0) || await page.evaluate(() => window.DUR) || DUR;
  const N = Math.round(dur * FPS), t0 = Date.now();
  for (let n = 0; n < N; n++) {
    const f = path.join(out, String(n + 1).padStart(4, '0') + '.jpg');
    if (fs.existsSync(f) && fs.statSync(f).size > 0) continue; // se puede retomar si se corta
    await frame(n / FPS, f, tmp);
    if (n % 60 === 0) console.log(`cuadro ${n + 1}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(out, '%04d.jpg'),
    // Sin grano en movimiento (Instagram lo convierte en bloques); un enfoque suave para que el texto aguante la recompresión
    '-vf', `scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int,unsharp=5:5:${arg('sharp', '0.35')}:5:5:0,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p`,
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'film', '-crf', arg('crf', '12'), '-x264-params', 'aq-mode=3:aq-strength=0.9',
    '-profile:v', 'high', '-level', '4.2', '-g', '30', '-movflags', '+faststart', path.join(dir, meta.mp4)], { stdio: 'inherit' });
  console.log(`ok ${meta.mp4} (${N} cuadros, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
server.close();
