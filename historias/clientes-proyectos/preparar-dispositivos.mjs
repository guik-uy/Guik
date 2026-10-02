// Prepara las fotos de dispositivos para los videos: encuentra la pantalla (relleno desde un punto adentro),
// ajusta las 4 esquinas con rectas sobre los bordes y pinta la pantalla de negro para poner contenido encima.
// Uso: NODE_PATH=$(npm root -g) node preparar-dispositivos.mjs
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const A = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const items = [
  { src: 'studio-display-original.png', out: 'studio-display.png', seed: [540, 480] },
  { src: 'ipad-manos-original.png', out: 'ipad-manos.png', seed: [593, 380], fix: { 2: [857.5, 579.5] }, // el pulgar tapa el borde derecho
    thumb: [[815,475],[827,477],[840,489],[852,506],[862,520],[862,592],[831,592],[829,573],[825,557],[820,540],[815,523],[811,507],[807,490],[809,480]] },
];
const b = await chromium.launch(); const p = await b.newPage();
for (const it of items) {
  const r = await p.evaluate(async ({ data, seed, fix, thumb }) => {
    const img = new Image(); img.src = data; await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, W, H), px = d.data;
    const lit = i => px[i + 3] > 200 && Math.max(px[i], px[i + 1], px[i + 2]) > 105;
    // relleno desde la semilla
    const R = new Uint8Array(W * H), st = [seed[1] * W + seed[0]]; R[st[0]] = 1;
    while (st.length) { const k = st.pop(), X = k % W, Y = (k - X) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = X + dx, ny = Y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx; if (!R[n] && lit(n * 4)) { R[n] = 1; st.push(n); } } }
    // agujeros del texto oscuro: cerrar por filas entre los extremos de la región
    let tl = [0, 0, 1e9], tr = [0, 0, -1e9], br = [0, 0, -1e9], bl = [0, 0, 1e9], cnt = 0;
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) if (R[y * W + X]) { cnt++;
      if (X + y < tl[2]) tl = [X, y, X + y]; if (X - y > tr[2]) tr = [X, y, X - y]; if (X + y > br[2]) br = [X, y, X + y]; if (X - y < bl[2]) bl = [X, y, X - y]; }
    let C = [tl, tr, br, bl].map(q => [q[0], q[1]]);
    // bordes: puntos del contorno exterior cerca de cada lado → recta por mínimos cuadrados totales
    const B = []; for (let y = 1; y < H - 1; y++) for (let X = 1; X < W - 1; X++) { const k = y * W + X; if (R[k] && (!R[k - 1] || !R[k + 1] || !R[k - W] || !R[k + W])) B.push([X, y]); }
    const lines = C.map((a, i) => { const bb = C[(i + 1) % 4], dx = bb[0] - a[0], dy = bb[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const pts = B.filter(([X, y]) => { const t = ((X - a[0]) * ux + (y - a[1]) * uy) / L, dist = Math.abs((X - a[0]) * uy - (y - a[1]) * ux); return t > .12 && t < .88 && dist < 7; });
      const mx = pts.reduce((s, q) => s + q[0], 0) / pts.length, my = pts.reduce((s, q) => s + q[1], 0) / pts.length;
      let sxx = 0, sxy = 0, syy = 0; for (const [X, y] of pts) { sxx += (X - mx) ** 2; sxy += (X - mx) * (y - my); syy += (y - my) ** 2; }
      const ang = Math.atan2(2 * sxy, sxx - syy) / 2; return { mx, my, vx: Math.cos(ang), vy: Math.sin(ang), n: pts.length }; });
    const inter = (A, Bq) => { const den = A.vx * Bq.vy - A.vy * Bq.vx, t = ((Bq.mx - A.mx) * Bq.vy - (Bq.my - A.my) * Bq.vx) / den; return [A.mx + t * A.vx, A.my + t * A.vy]; };
    const Q = [inter(lines[3], lines[0]), inter(lines[0], lines[1]), inter(lines[1], lines[2]), inter(lines[2], lines[3])];
    for (const k in (fix || {})) Q[k] = fix[k];
    // máscara de la pantalla visible: región + agujeros del texto (lo que no se alcanza desde afuera). El pulgar queda afuera.
    const O = new Uint8Array(W * H), so = [];
    for (let X = 0; X < W; X++) { so.push(X, (H - 1) * W + X); } for (let y = 0; y < H; y++) { so.push(y * W, y * W + W - 1); }
    for (const k of so) if (!R[k]) O[k] = 1;
    const st2 = so.filter(k => O[k]);
    while (st2.length) { const k = st2.pop(), X = k % W, Y = (k - X) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = X + dx, ny = Y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx; if (!O[n] && !R[n]) { O[n] = 1; st2.push(n); } } }
    const mc = document.createElement('canvas'); mc.width = W; mc.height = H; const mx2 = mc.getContext('2d'), md = mx2.createImageData(W, H);
    // dentro de la pantalla todo es pantalla, salvo el pulgar (polígono medido a mano)
    const inPoly = (X, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && X < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const qc = [Q.reduce((s2, q) => s2 + q[0], 0) / 4, Q.reduce((s2, q) => s2 + q[1], 0) / 4];
    const S2 = Q.map(([qx, qy]) => { const dx = qx - qc[0], dy = qy - qc[1], l = Math.hypot(dx, dy); return [qx - dx / l * 4, qy - dy / l * 4]; });
    const inS = (X, y) => { for (let k = 0; k < 4; k++) { const [x1, y1] = S2[k], [x2, y2] = S2[(k + 1) % 4]; if ((x2 - x1) * (y - y1) - (y2 - y1) * (X - x1) < 0) return false; } return true; };
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
      const k = y * W + X, inT = thumb && inPoly(X, y, thumb);
      if (inS(X, y) && !inT) O[k] = 0;
      else if (inT) O[k] = 1; // en el pulgar manda el polígono: borde parejo
    }
    for (let k = 0; k < W * H; k++) if (!O[k]) { md.data[k * 4] = md.data[k * 4 + 1] = md.data[k * 4 + 2] = 255; md.data[k * 4 + 3] = 255; }
    mx2.putImageData(md, 0, 0);
    // pintar de negro: región + interior del cuadrilátero (2 px más grande)
    const cx = Q.reduce((s, q) => s + q[0], 0) / 4, cy = Q.reduce((s, q) => s + q[1], 0) / 4;
    const G = Q.map(([qx, qy]) => { const dx = qx - cx, dy = qy - cy, l = Math.hypot(dx, dy); return [qx + dx / l * 2, qy + dy / l * 2]; });
    const inside = (X, y) => { for (let k = 0; k < 4; k++) { const [x1, y1] = G[k], [x2, y2] = G[(k + 1) % 4]; if ((x2 - x1) * (y - y1) - (y2 - y1) * (X - x1) < 0) return false; } return true; };
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) { const k = y * W + X; if (R[k] || inside(X, y)) { const i = k * 4; px[i] = 8; px[i + 1] = 8; px[i + 2] = 11; if (px[i + 3] < 250) px[i + 3] = 255; } }
    x.putImageData(d, 0, 0);
    return { W, H, cnt, Q: Q.map(q => q.map(v => +v.toFixed(1))), n: lines.map(l => l.n), png: c.toDataURL('image/png'), mask: mc.toDataURL('image/png') };
  }, { data: 'data:image/png;base64,' + fs.readFileSync(path.join(A, it.src)).toString('base64'), seed: it.seed, fix: it.fix, thumb: it.thumb });
  fs.writeFileSync(path.join(A, it.out.replace('.png', '-pantalla.png')), Buffer.from(r.mask.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(A, it.out), Buffer.from(r.png.split(',')[1], 'base64'));
  console.log(it.out, r.W + 'x' + r.H, 'px pantalla', r.cnt, 'puntos por lado', r.n.join('/'), 'esquinas TL TR BR BL', JSON.stringify(r.Q));
}
await b.close();
