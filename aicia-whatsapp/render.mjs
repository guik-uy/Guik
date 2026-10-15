// Portada de WhatsApp Business de Aicia: PNG final 1920×1080, prueba con el recorte y la foto de perfil, y vista como en el perfil.
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node aicia-whatsapp/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.dirname(here);
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/aicia-whatsapp/portada.html`;
const browser = await chromium.launch();
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
const out = f => path.join(here, f);
const W = 1920, H = 1080;

for (const prueba of [false, true]) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await page.goto(url + (prueba ? '?prueba' : ''));
  await page.evaluate(() => document.fonts.ready);
  if (!prueba) {
    // Control con lo medido en la captura de Guille: se ve y 104–976 y la foto de perfil es un círculo de r 333 en (960, 757).
    // Nada importante puede tocar ese círculo más 40 px de aire, ni quedar a menos de 40 px del recorte o de los costados.
    const qa = await page.evaluate(() => {
      const o = [], AV = { x: 960, y: 757, r: 333 + 40 };
      const near = r => { const dx = Math.max(r.left - AV.x, 0, AV.x - r.right), dy = Math.max(r.top - AV.y, 0, AV.y - r.bottom); return Math.hypot(dx, dy) < AV.r; };
      for (const f of ['600 84px Geist', 'italic 84px "Instrument Serif"', '500 24px "Geist Mono"']) if (!document.fonts.check(f, 'ñá¿¡')) o.push('fuente sin cargar: ' + f);
      const parts = [...document.querySelectorAll('.tx h1, .sub li, .win, .small b')];
      // el texto de cada línea, medido por su tinta (no por la caja del bloque)
      const box = el => { if (el.matches('.win')) return el.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };
      const sm = document.querySelector('.small'); const rg = document.createRange(); rg.selectNodeContents(sm);
      for (const [n, r] of [...parts.map(el => [el.className || el.tagName + ' ' + el.textContent.slice(0, 18), box(el)]), ['small', rg.getBoundingClientRect()]]) {
        if (near(r)) o.push(`${n} toca la foto de perfil`);
        if (r.left < 150 || r.right > 1770 || r.top < 104 + 40 || r.bottom > 976 - 40) o.push(`${n} muy cerca del recorte (${r.left | 0},${r.top | 0}–${r.right | 0},${r.bottom | 0})`);
      }
      const tx = document.querySelector('.tx').getBoundingClientRect(), win = document.querySelector('.win').getBoundingClientRect();
      if (tx.bottom > 560) o.push(`el texto baja de la mitad (${tx.bottom | 0})`);
      if (tx.right > win.left - 60) o.push('el texto se acerca al chat');
      const sizes = new Set(); const walk = n => { if (n.nodeType === 3 && n.textContent.trim()) sizes.add(getComputedStyle(n.parentElement).fontSize); n.childNodes.forEach(walk); };
      walk(document.getElementById('cover'));
      return { o, tx: [tx.left, tx.top, tx.right, tx.bottom].map(Math.round), win: [win.left, win.top, win.right, win.bottom].map(Math.round), sizes: [...sizes] };
    });
    console.log(qa.o.length ? 'QA:\n  ' + qa.o.join('\n  ') : 'QA: ok', '· texto', qa.tx.join(','), '· chat', qa.win.join(','), '· tamaños', qa.sizes.join(' / '));
  }
  const raw = out('.raw@2x.png');
  await page.screenshot({ path: raw });
  await page.close();
  const name = prueba ? 'portada-whatsapp-prueba.png' : 'portada-whatsapp.png';
  ff('-i', raw, '-vf', `scale=${W}:${H}:flags=lanczos+accurate_rnd+full_chroma_int`, '-pix_fmt', 'rgb24', out(name));
  // Vista como en el perfil (iPhone, 360 pt = 720 px): WhatsApp corta arriba y abajo (se ve y 104–976) y pone encima la foto
  // de perfil (círculo de r 333 con borde oscuro, centro 960, 757). Se arma al doble y se achica, para que el círculo quede suave.
  if (!prueba) {
    const logo = path.join(root, 'historias', 'logo-perfil', 'aicia-logo-perfil.png'), k = 1440 / 1920;
    const cx = Math.round(960 * k), cy = Math.round((757 - 104) * k), R = Math.round(333 * k), r = Math.round(316 * k);
    const disc = rr => `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(${rr}+0.5-hypot(X-${rr},Y-${rr}),0,1)'`;
    ff('-i', raw, '-i', logo, '-f', 'lavfi', '-i', `color=c=0x0B0B10:s=${2 * R}x${2 * R}`, '-filter_complex',
      `[0]crop=3840:1744:0:208,scale=1440:-1:flags=lanczos,pad=1440:${cy + R + 60}:0:0:black[bg];` +
      `[2]${disc(R)}[ring];[1]scale=${2 * r}:${2 * r}:flags=lanczos,${disc(r)}[lg];` +
      `[bg][ring]overlay=${cx - R}:${cy - R}[a];[a][lg]overlay=${cx - r}:${cy - r},scale=720:-1:flags=lanczos`,
      '-frames:v', '1', '-pix_fmt', 'rgb24', out('vista-perfil-whatsapp.png'));
  }
  fs.rmSync(raw);
  console.log('ok', name, (fs.statSync(out(name)).size / 1e6).toFixed(2) + ' MB');
}
await browser.close(); server.close();
