// Portada de WhatsApp Business de Aicia: PNG final 1920×1080, prueba con la foto de perfil simulada y vista en celular.
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
    // Control: fuentes, nada en la zona libre (tercio inferior central), nada en el margen de recorte, texto arriba
    const qa = await page.evaluate(() => {
      const o = [], hit = (r, x0, y0, x1, y1) => r.right > x0 && r.left < x1 && r.bottom > y0 && r.top < y1;
      for (const f of ['600 82px Geist', 'italic 82px "Instrument Serif"', '500 24px "Geist Mono"']) if (!document.fonts.check(f, 'ñá¿¡')) o.push('fuente sin cargar: ' + f);
      for (const el of document.querySelectorAll('.tx, .win, .small')) {
        const r = el.getBoundingClientRect(), n = el.className;
        if (hit(r, 640, 720, 1280, 1080)) o.push(`${n} en la zona de la foto`);
        if (r.left < 150 || r.right > 1770 || r.top < 90 || r.bottom > 990) o.push(`${n} en el margen de recorte`);
      }
      const tx = document.querySelector('.tx').getBoundingClientRect(), win = document.querySelector('.win').getBoundingClientRect();
      if (tx.bottom > 540) o.push(`el texto baja de la mitad (${tx.bottom | 0})`);
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
  // Vista en celular: la portada al ancho de un teléfono (390 px), para ver si se lee
  if (!prueba) ff('-i', raw, '-vf', 'scale=780:-1:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', out('vista-celular@2x.png'));
  fs.rmSync(raw);
  console.log('ok', name, (fs.statSync(out(name)).size / 1e6).toFixed(2) + ' MB');
}
await browser.close(); server.close();
