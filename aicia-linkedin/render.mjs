// Banner de LinkedIn de Aicia: vista previa con la zona de la foto, vista al 50 % y los PNG finales.
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node aicia-linkedin/render.mjs
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
const url = `http://127.0.0.1:${server.address().port}/aicia-linkedin/banner.html`;
const browser = await chromium.launch();
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
const out = f => path.join(here, f);

// 1) Vista previa con la guía (zona de la foto y franja inferior) + control
const page = await browser.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: 1 });
await page.goto(url + '?guia');
await page.evaluate(() => document.fonts.ready);
const qa = await page.evaluate(() => {
  const o = [];
  for (const f of ['600 46px Geist', 'italic 46px "Instrument Serif"', '500 18px "Geist Mono"']) if (!document.fonts.check(f, 'ñá¿')) o.push('fuente sin cargar: ' + f);
  // ningún texto en la zona de la foto (x < 520) ni en la franja inferior (y > 306)
  const texts = [...document.querySelectorAll('.brand, .win, h1, .sub, .small')];
  texts.forEach(el => { const r = el.getBoundingClientRect(); if (r.left < 520 || r.bottom > 306) o.push(`en zona prohibida: ${el.className || el.tagName} ${r.left.toFixed(0)},${r.top.toFixed(0)}–${r.right.toFixed(0)},${r.bottom.toFixed(0)}`); if (r.right > 1584 - 40) o.push(`muy pegado al borde: ${el.className || el.tagName}`); });
  // máximo 3 tamaños de texto
  const sizes = new Set();
  const walk = n => { if (n.nodeType === 3 && n.textContent.trim()) sizes.add(getComputedStyle(n.parentElement).fontSize); n.childNodes.forEach(walk); };
  walk(document.getElementById('banner'));
  if (sizes.size > 3) o.push('más de 3 tamaños: ' + [...sizes].join(', '));
  const tx = document.querySelector('.tx').getBoundingClientRect();
  return { o, sizes: [...sizes], textoCentro: Math.round((tx.top + tx.bottom) / 2), texto: [Math.round(tx.top), Math.round(tx.bottom)] };
});
console.log(qa.o.length ? 'QA:\n  ' + qa.o.join('\n  ') : 'QA: ok', '· tamaños', qa.sizes.join(' / '), '· bloque de texto y', qa.texto.join('–'), '(centro', qa.textoCentro + ')');
await page.screenshot({ path: out('vista-previa-guia.png') });
await page.close();

// 2) Final: dibujado al doble y achicado con lanczos (como las historias)
const hi = await browser.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: 2 });
await hi.goto(url);
await hi.evaluate(() => document.fonts.ready);
await hi.screenshot({ path: out('.raw@2x.png') });
await hi.close();
ff('-i', out('.raw@2x.png'), '-pix_fmt', 'rgb24', out('banner-linkedin@2x.png'));
ff('-i', out('.raw@2x.png'), '-vf', 'scale=1584:396:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', out('banner-linkedin.png'));
ff('-i', out('.raw@2x.png'), '-vf', 'scale=792:198:flags=lanczos+accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', out('vista-previa-50.png'));
fs.rmSync(out('.raw@2x.png'));
for (const f of ['banner-linkedin.png', 'banner-linkedin@2x.png', 'vista-previa-50.png']) console.log('ok', f, (fs.statSync(out(f)).size / 1e6).toFixed(2) + ' MB');
await browser.close(); server.close();
