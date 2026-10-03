// Recorta la estatua del filósofo con la laptop (assets/filosofo-laptop-original.jpg, fondo blanco) → assets/filosofo-laptop.png
// 1) fondo = blanco conectado con el borde (+ huecos blancos grandes encerrados)
// 2) borde suave: alfa según cuánto blanco tiene el píxel, y se le quita el blanco al color (sin halo sobre el fondo oscuro)
// 3) se agranda al doble con buen filtrado y un enfoque suave
// Uso: NODE_PATH=$(npm root -g) node preparar-filosofo.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const A = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const data = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(A, 'filosofo-laptop-original.jpg')).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate(async data => {
  const img = new Image(); img.src = data; await img.decode();
  const W = img.width, H = img.height, N = W * H;
  const c = new OffscreenCanvas(W, H), x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const id = x.getImageData(0, 0, W, H), d = id.data;
  const mn = new Uint8Array(N), sp = new Uint8Array(N);
  for (let i = 0; i < N; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; mn[i] = Math.min(r, g, b); sp[i] = Math.max(r, g, b) - mn[i]; }
  const bg = new Uint8Array(N), q = new Int32Array(N);
  const cand = i => mn[i] >= 236 && sp[i] <= 14;
  // 1) relleno desde el borde
  let h = 0, t = 0;
  for (let px = 0; px < W; px++) for (const py of [0, H - 1]) { const i = py * W + px; if (cand(i) && !bg[i]) { bg[i] = 1; q[t++] = i; } }
  for (let py = 0; py < H; py++) for (const px of [0, W - 1]) { const i = py * W + px; if (cand(i) && !bg[i]) { bg[i] = 1; q[t++] = i; } }
  const nb = i => { const px = i % W, py = (i / W) | 0, r = []; if (px > 0) r.push(i - 1); if (px < W - 1) r.push(i + 1); if (py > 0) r.push(i - W); if (py < H - 1) r.push(i + W); return r; };
  while (h < t) { const i = q[h++]; for (const j of nb(i)) if (!bg[j] && cand(j)) { bg[j] = 1; q[t++] = j; } }
  // huecos blancos encerrados (entre brazo y cuerpo, etc.), si son grandes
  const seen = new Uint8Array(N);
  for (let s = 0; s < N; s++) {
    if (bg[s] || seen[s] || !(mn[s] >= 246 && sp[s] <= 8)) continue;
    const comp = []; h = 0; t = 0; q[t++] = s; seen[s] = 1;
    while (h < t) { const i = q[h++]; comp.push(i); for (const j of nb(i)) if (!seen[j] && !bg[j] && mn[j] >= 246 && sp[j] <= 8) { seen[j] = 1; q[t++] = j; } }
    if (comp.length >= 250) for (const i of comp) bg[i] = 1;
  }
  // 2) distancia al fondo (para la banda del borde) y alfa
  const dist = new Uint8Array(N).fill(255); h = 0; t = 0;
  for (let i = 0; i < N; i++) if (bg[i]) { dist[i] = 0; q[t++] = i; }
  while (h < t) { const i = q[h++]; if (dist[i] >= 4) continue; for (const j of nb(i)) if (dist[j] > dist[i] + 1) { dist[j] = dist[i] + 1; q[t++] = j; } }
  for (let i = 0; i < N; i++) {
    let a = 1;
    if (bg[i]) a = 0;
    else if (dist[i] <= 3) a = Math.min(1, Math.max(0, (252 - mn[i]) / 34));
    if (dist[i] === 1) a = Math.min(a, .85);
    d[i * 4 + 3] = Math.round(a * 255);
    if (a > 0 && a < 1) for (let k = 0; k < 3; k++) d[i * 4 + k] = Math.max(0, Math.min(255, (d[i * 4 + k] - (1 - a) * 255) / a));
  }
  x.putImageData(id, 0, 0);
  // 3) al doble + enfoque suave
  const W2 = W * 2, H2 = H * 2, c2 = new OffscreenCanvas(W2, H2), x2 = c2.getContext('2d');
  x2.imageSmoothingEnabled = true; x2.imageSmoothingQuality = 'high'; x2.drawImage(c, 0, 0, W2, H2);
  const id2 = x2.getImageData(0, 0, W2, H2), e = id2.data, src = new Uint8ClampedArray(e);
  for (let py = 1; py < H2 - 1; py++) for (let px = 1; px < W2 - 1; px++) {
    const i = (py * W2 + px) * 4; if (src[i + 3] < 250) continue;
    for (let k = 0; k < 3; k++) { let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += src[i + (dy * W2 + dx) * 4 + k]; e[i + k] = src[i + k] + .5 * (src[i + k] - s / 9); }
  }
  x2.putImageData(id2, 0, 0);
  const blob = await c2.convertToBlob({ type: 'image/png' });
  const buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
  for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768));
  return btoa(s);
}, data);
fs.writeFileSync(path.join(A, 'filosofo-laptop.png'), Buffer.from(out, 'base64'));
console.log('ok assets/filosofo-laptop.png');
await browser.close();
