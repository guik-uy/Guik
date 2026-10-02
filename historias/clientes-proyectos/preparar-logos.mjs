// Adapta logos de clientes para fondo oscuro.
// Bs.As. Top: el negro pasa a blanco y el verde se aclara un poco; recorta el espacio vacío.
// Uso: NODE_PATH=$(npm root -g) node preparar-logos.mjs
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const A = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const b = await chromium.launch(); const p = await b.newPage();
async function proc(src, dst, mode) {
  const ext = path.extname(src).slice(1);
  const url = `data:image/${ext === 'webp' ? 'webp' : 'png'};base64,` + fs.readFileSync(path.join(A, src)).toString('base64');
  const out = await p.evaluate(async ({ url, mode }) => {
    const im = new Image(); im.src = url; await im.decode();
    const W = im.naturalWidth, H = im.naturalHeight;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const id = g.getImageData(0, 0, W, H), d = id.data;
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3]; if (a < 8) { d[i + 3] = 0; continue; }
      if (mode === 'invert') {
        const r = d[i], gg = d[i + 1], bb = d[i + 2], mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb);
        if (mx - mn < 60) { d[i] = d[i + 1] = d[i + 2] = 255; }                 // negro/gris → blanco
        else { const k = 205 / Math.max(mx, 1); d[i] = Math.min(255, r * k + 18); d[i + 1] = Math.min(255, gg * k); d[i + 2] = Math.min(255, bb * k + 10); } // verde más claro
      }
      const px = (i / 4) % W, py = Math.floor(i / 4 / W);
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    g.putImageData(id, 0, 0);
    const pad = 6, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2;
    const c2 = document.createElement('canvas'); c2.width = cw; c2.height = ch;
    c2.getContext('2d').drawImage(c, x0 - pad, y0 - pad, cw, ch, 0, 0, cw, ch);
    return { png: c2.toDataURL('image/png'), w: cw, h: ch };
  }, { url, mode });
  fs.writeFileSync(path.join(A, dst), Buffer.from(out.png.split(',')[1], 'base64'));
  console.log(dst, out.w + '×' + out.h);
}
await proc('logo-bsas-top-original-b.png', 'logo-bsas-top-blanco.png', 'invert');
await proc('logo-fc-barber-original.png', 'logo-fc-barber.png', 'crop');
await b.close();
