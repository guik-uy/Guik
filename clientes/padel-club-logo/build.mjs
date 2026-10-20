// Logo final del club de pádel (propuesta 3, "pelotas en fila", la que eligió Guille), todo en vectores:
// el símbolo se arma con círculos y el texto "Pádel Club" son los contornos reales de Geist 600 (glyphs-geist-600.json, sacado
// con glyphs.py), ubicados letra por letra con las posiciones que mide el navegador (así respeta el interletrado y el kerning).
// Saca los SVG y los PNG (transparentes, 4000 px) en final/, la foto de perfil, el favicon y una hoja de presentación.
// Uso (desde la raíz del repo): NODE_PATH=$(npm root -g) node clientes/padel-club-logo/build.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', '..'), out = path.join(here, 'final');
fs.mkdirSync(out, { recursive: true });
const NAVY = '#050A14', LIME = '#D8F84A', WHITE = '#FFFFFF';
const G = JSON.parse(fs.readFileSync(path.join(here, 'glyphs-geist-600.json'), 'utf8'));
const TEXT = 'Pádel Club', LS = -0.035; // interletrado como en la imagen de texto (apretado)

const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();

// 1) Dónde cae cada letra (a 1000 px = unidades de la fuente), medido con Geist 600 en el navegador
const mp = await browser.newPage();
// Se mide en una página servida desde el mismo origen que la fuente (desde about:blank la fuente no carga y las letras se pisan)
fs.writeFileSync(path.join(here, '.medir.html'), `<!doctype html><style>@font-face{font-family:G;src:url(/aicia-web/fonts/geist-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
  body{margin:0}span{font:600 1000px/1 G;letter-spacing:${LS}em;white-space:pre}</style><span id="t">${TEXT}</span>`);
await mp.goto(`${base}/clientes/padel-club-logo/.medir.html`);
await mp.evaluate(() => document.fonts.ready);
fs.rmSync(path.join(here, '.medir.html'));
if (!await mp.evaluate(() => document.fonts.check('600 1000px G', 'Pádel Club'))) throw new Error('No cargó Geist: las posiciones de las letras saldrían mal');
const xs = await mp.evaluate(() => { const t = document.getElementById('t').firstChild, x0 = document.getElementById('t').getBoundingClientRect().left;
  return [...t.textContent].map((c, i) => { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1); return r.getBoundingClientRect().left - x0; }); });
await mp.close();
const lastX = xs[xs.length - 1] + G.glyphs[TEXT.at(-1)].adv; // ancho de la palabra (sin el interletrado final)
// Contorno de la palabra en una escala dada (F = tamaño de letra), con la línea de base en y = 0
const word = (F, fill) => { const k = F / G.upm; return `<g fill="${fill}">` + [...TEXT].map((c, i) => c === ' ' ? '' :
  `<path transform="translate(${(xs[i] * k).toFixed(3)} 0) scale(${k.toFixed(5)} ${(-k).toFixed(5)})" d="${G.glyphs[c].d}"/>`).join('') + '</g>'; };
const wordW = F => lastX * F / G.upm, capH = F => G.cap * F / G.upm;

// 2) Símbolo: tres pelotas de radio R que se encastran (cada costura es el borde de la pelota de al lado, como en la referencia),
//    separadas por un corte de grosor g. La del medio va adelante y en lima. Ocupa 0..90 × 0..36,8.
const R = 20, S = 26.6, g = 3.2, cy = R - g / 2, cx = [R - g / 2, R - g / 2 + S, R - g / 2 + 2 * S];
const SW = cx[2] + R - g / 2, SH = 2 * R - g;
let mid = 0;
const symbol = (side, center, x = 0, y = 0, k = 1) => { const id = 'm' + (mid++);
  const cuts = [cx[0] - S, ...cx, cx[2] + S].map(c => `<circle cx="${c.toFixed(2)}" cy="${cy}" r="${R}" fill="none" stroke="#000" stroke-width="${g}"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${k})"><mask id="${id}" maskUnits="userSpaceOnUse" x="-2" y="-2" width="${SW + 4}" height="${SH + 4}"><rect x="-2" y="-2" width="${SW + 4}" height="${SH + 4}" fill="#fff"/>${cuts}</mask>` +
    `<g mask="url(#${id})"><circle cx="${cx[0]}" cy="${cy}" r="${R}" fill="${side}"/><circle cx="${cx[2]}" cy="${cy}" r="${R}" fill="${side}"/><circle cx="${cx[1]}" cy="${cy}" r="${R}" fill="${center}"/></g></g>`; };

// 3) Armados: horizontal (símbolo + palabra, la altura de las mayúsculas es el 62 % del símbolo) y vertical
const F_H = SH * 0.62 / (G.cap / G.upm), GAP_H = SH * 0.45;
const horiz = (side, center, txt) => { const w = SW + GAP_H + wordW(F_H), base = cy + capH(F_H) / 2;
  return { w, h: SH, body: symbol(side, center) + `<g transform="translate(${SW + GAP_H} ${base})">${word(F_H, txt)}</g>` }; };
const vert = (side, center, txt) => { const F = F_H, ww = wordW(F), k = ww * 0.78 / SW, sw = SW * k, sh = SH * k, gap = sh * 0.42, w = Math.max(ww, sw), h = sh + gap + capH(F);
  return { w, h, body: symbol(side, center, (w - sw) / 2, 0, k) + `<g transform="translate(${(w - ww) / 2} ${sh + gap + capH(F)})">${word(F, txt)}</g>` }; };
const sym = (side, center) => ({ w: SW, h: SH, body: symbol(side, center) });
const svg = ({ w, h, body }, pad = 0, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${(w + 2 * pad).toFixed(2)} ${(h + 2 * pad).toFixed(2)}">${bg ? `<rect x="${-pad}" y="${-pad}" width="${w + 2 * pad}" height="${h + 2 * pad}" fill="${bg}"/>` : ''}${body}</svg>`;

const FILES = {
  'padel-club-horizontal': [horiz(WHITE, LIME, WHITE), 'para fondos oscuros'],
  'padel-club-horizontal-claro': [horiz(NAVY, LIME, NAVY), 'para fondos claros'],
  'padel-club-vertical': [vert(WHITE, LIME, WHITE), 'para fondos oscuros'],
  'padel-club-vertical-claro': [vert(NAVY, LIME, NAVY), 'para fondos claros'],
  'padel-club-simbolo': [sym(WHITE, LIME), 'para fondos oscuros'],
  'padel-club-simbolo-claro': [sym(NAVY, LIME), 'para fondos claros'],
  'padel-club-blanco': [horiz(WHITE, WHITE, WHITE), 'un color, sobre fotos u oscuro'],
  'padel-club-negro': [horiz(NAVY, NAVY, NAVY), 'un color, para imprimir o sellos'],
};
const pad = 4; // un poco de aire para que nada toque el borde
for (const [name, [d]] of Object.entries(FILES)) fs.writeFileSync(path.join(out, name + '.svg'), svg(d, pad));
// Foto de perfil y favicon: el símbolo centrado sobre el azul noche (ocupa ~64 % del ancho)
const sq = (size, frac, rr = 0) => { const k = size * frac / SW; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${rr}" fill="${NAVY}"/>${symbol(WHITE, LIME, (size - SW * k) / 2, (size - SH * k) / 2, k)}</svg>`; };
fs.writeFileSync(path.join(out, 'padel-club-perfil.svg'), sq(1080, 0.64));
fs.writeFileSync(path.join(out, 'padel-club-favicon.svg'), sq(512, 0.78, 112));

// 4) PNG: cada SVG a 4000 px de ancho (sin fondo), perfil 1080×1080 y favicon 512×512
const pg = await browser.newPage();
const png = async (file, W, H, transparent) => {
  const src = fs.readFileSync(path.join(out, file + '.svg'), 'utf8');
  await pg.setViewportSize({ width: W, height: H });
  await pg.setContent(`<html style="background:transparent"><body style="margin:0;background:transparent">${src.replace('<svg ', `<svg width="${W}" height="${H}" `)}</body></html>`);
  await pg.screenshot({ path: path.join(out, file + '.png'), omitBackground: transparent, clip: { x: 0, y: 0, width: W, height: H } });
};
for (const [name, [d]] of Object.entries(FILES)) { const W = 4000, H = Math.round(W * (d.h + 2 * pad) / (d.w + 2 * pad)); await png(name, W, H, true); }
await png('padel-club-perfil', 1080, 1080, false); await png('padel-club-favicon', 512, 512, true);

// 5) Hoja de presentación con todo
const tile = (file, bg, h = 300) => `<div style="background:${bg};border-radius:20px;height:${h}px;display:flex;align-items:center;justify-content:center;padding:40px"><img src="${file}.svg" style="max-width:100%;max-height:${h - 120}px"></div>`;
fs.writeFileSync(path.join(out, '.hoja.html'), `<!doctype html><html><body style="margin:0;background:#0E1018;padding:48px;width:1500px;font:600 26px/1.2 system-ui;color:#fff">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
${tile('padel-club-horizontal', NAVY)}${tile('padel-club-horizontal-claro', '#F4F5F7')}
${tile('padel-club-vertical', NAVY, 380)}${tile('padel-club-vertical-claro', '#F4F5F7', 380)}
${tile('padel-club-blanco', '#1D3A2A')}${tile('padel-club-negro', '#FFFFFF')}
</div>
<div style="display:flex;gap:28px;align-items:center;margin-top:28px">
  <img src="padel-club-perfil.svg" style="width:240px;border-radius:50%"><img src="padel-club-perfil.svg" style="width:110px;border-radius:50%"><img src="padel-club-perfil.svg" style="width:48px;border-radius:50%">
  <img src="padel-club-favicon.svg" style="width:96px"><img src="padel-club-favicon.svg" style="width:32px"><img src="padel-club-favicon.svg" style="width:16px">
  <div style="margin-left:auto;background:#F4F5F7;border-radius:20px;padding:30px 40px"><img src="padel-club-simbolo-claro.svg" style="height:90px"></div>
</div></body></html>`);
const hp = await browser.newPage({ viewport: { width: 1596, height: 800 }, deviceScaleFactor: 2 });
await hp.goto(`${base}/clientes/padel-club-logo/final/.hoja.html`); await hp.waitForLoadState('load');
await hp.screenshot({ path: path.join(here, 'presentacion.png'), fullPage: true });
fs.rmSync(path.join(out, '.hoja.html'));
for (const f of fs.readdirSync(out).sort()) console.log('ok', f, (fs.statSync(path.join(out, f)).size / 1e3).toFixed(0) + ' KB');
await browser.close(); server.close();
