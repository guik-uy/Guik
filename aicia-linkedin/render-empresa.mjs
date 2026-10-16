// Banner de la página de empresa de Aicia en LinkedIn: 1128×191 y 2256×382 (dibujado al cuádruple y achicado con lanczos),
// más la prueba con el logo simulado. Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node aicia-linkedin/render-empresa.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.dirname(here), dir = path.join(here, 'empresa');
fs.mkdirSync(dir, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/aicia-linkedin/banner-empresa.html`;
const browser = await chromium.launch();
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
const out = f => path.join(dir, f);
const sc = f => `scale=${f}:flags=lanczos+accurate_rnd+full_chroma_int`;

for (const prueba of [false, true]) {
  const page = await browser.newPage({ viewport: { width: 1128, height: 191 }, deviceScaleFactor: 4 });
  await page.goto(url + (prueba ? '?prueba' : ''));
  await page.evaluate(() => document.fonts.ready);
  if (!prueba) {
    // Control: fuentes, nada en la zona del logo (x < 226 en la mitad de abajo), todo dentro del centro (el celular corta los
    // costados: se deja ~10 % de cada lado), aire arriba y abajo, y que el texto no se pegue al chat
    const qa = await page.evaluate(() => {
      const o = [];
      for (const f of ['600 32px Geist', 'italic 32px "Instrument Serif"', '500 13px "Geist Mono"']) if (!document.fonts.check(f, 'ñá¿¡')) o.push('fuente sin cargar: ' + f);
      const ink = el => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };
      const parts = [['título', ink(document.querySelector('h1'))], ['línea', ink(document.querySelector('.sub'))], ['chat', document.querySelector('.win').getBoundingClientRect()]];
      for (const [n, r] of parts) {
        if (r.left < 226 && r.bottom > 95) o.push(`${n} en la zona del logo`);
        if (r.left < 113 + 8 || r.right > 1128 - 113 - 8) o.push(`${n} en el margen de los costados (${r.left | 0}–${r.right | 0})`);
        if (r.top < 22 || r.bottom > 191 - 22) o.push(`${n} pegado arriba o abajo (${r.top | 0}–${r.bottom | 0})`);
      }
      const t = Math.max(parts[0][1].right, parts[1][1].right), c = parts[2][1].left;
      if (c - t < 18) o.push('el texto se pega al chat');
      const sizes = new Set(); const walk = n => { if (n.nodeType === 3 && n.textContent.trim()) sizes.add(getComputedStyle(n.parentElement).fontSize); n.childNodes.forEach(walk); };
      walk(document.querySelector('.tx')); walk(document.querySelector('.win'));
      return { o, boxes: parts.map(([n, r]) => `${n} ${r.left | 0}–${r.right | 0} × ${r.top | 0}–${r.bottom | 0}`), sizes: [...sizes] };
    });
    console.log(qa.o.length ? 'QA:\n  ' + qa.o.join('\n  ') : 'QA: ok', '·', qa.boxes.join(' · '), '· tamaños', qa.sizes.join(' / '));
  }
  const raw = out('.raw@4x.png');
  await page.screenshot({ path: raw });
  await page.close();
  if (prueba) ff('-i', raw, '-vf', sc('2256:382'), '-pix_fmt', 'rgb24', out('banner-empresa-prueba.png'));
  else {
    ff('-i', raw, '-vf', sc('2256:382'), '-pix_fmt', 'rgb24', out('banner-empresa@2x.png'));
    ff('-i', raw, '-vf', sc('1128:191'), '-pix_fmt', 'rgb24', out('banner-empresa.png'));
  }
  fs.rmSync(raw);
}
for (const f of ['banner-empresa.png', 'banner-empresa@2x.png', 'banner-empresa-prueba.png']) console.log('ok', f, (fs.statSync(out(f)).size / 1e3).toFixed(0) + ' KB');
await browser.close(); server.close();
