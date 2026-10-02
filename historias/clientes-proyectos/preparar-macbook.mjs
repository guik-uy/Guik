// Prepara la foto de las manos con la MacBook: detecta las 4 esquinas de la pantalla
// (zona verde del original) y la pinta de negro para poder poner contenido nuevo encima.
// Uso: NODE_PATH=$(npm root -g) node preparar-macbook.mjs
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const A = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const b = await chromium.launch(); const p = await b.newPage();
const res = await p.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, H), px = d.data;
  const green = i => px[i + 3] > 200 && px[i + 1] > 140 && px[i + 1] - Math.max(px[i], px[i + 2]) > 60;
  // Esquinas: extremos según diagonales, sobre los píxeles verdes
  let tl = [0, 0, 1e9], tr = [0, 0, -1e9], br = [0, 0, -1e9], bl = [0, 0, 1e9];
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const i = (y * W + X) * 4; if (!green(i)) continue;
    if (X + y < tl[2]) tl = [X, y, X + y]; if (X - y > tr[2]) tr = [X, y, X - y];
    if (X + y > br[2]) br = [X, y, X + y]; if (X - y < bl[2]) bl = [X, y, X - y];
  }
  // Pintar la pantalla: todo lo que está dentro del cuadrilátero (con 3 px de margen) pasa a negro
  const Q = [tl, tr, br, bl].map(q => [q[0], q[1]]);
  const cx = Q.reduce((s, q) => s + q[0], 0) / 4, cy = Q.reduce((s, q) => s + q[1], 0) / 4;
  const grow = Q.map(([qx, qy]) => { const dx = qx - cx, dy = qy - cy, l = Math.hypot(dx, dy); return [qx + dx / l * 3, qy + dy / l * 3]; });
  const inside = (X, y) => { let s = 0; for (let k = 0; k < 4; k++) { const [x1, y1] = grow[k], [x2, y2] = grow[(k + 1) % 4]; const cr = (x2 - x1) * (y - y1) - (y2 - y1) * (X - x1); if (cr < 0) return false; } return true; };
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const i = (y * W + X) * 4;
    if (inside(X, y) || green(i) || (px[i + 3] > 0 && px[i + 1] - Math.max(px[i], px[i + 2]) > 25)) { px[i] = 8; px[i + 1] = 8; px[i + 2] = 11; }
  }
  x.putImageData(d, 0, 0);
  return { W, H, corners: Q, png: c.toDataURL('image/png') };
}, 'data:image/png;base64,' + fs.readFileSync(path.join(A, 'macbook-manos-original.png')).toString('base64'));
fs.writeFileSync(path.join(A, 'macbook-manos.png'), Buffer.from(res.png.split(',')[1], 'base64'));
console.log('tamaño', res.W, res.H, 'esquinas TL TR BR BL', JSON.stringify(res.corners));
await b.close();
