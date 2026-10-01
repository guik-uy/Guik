// Quita el celular viejo de assets/mano-robot-celular.png (deja dedos y palma) y mide la pantalla del iPhone.
// Uso: NODE_PATH=$(npm root -g) node preparar-mano.mjs
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
import { fileURLToPath } from 'node:url'; import path from 'node:path';
const A = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets') + '/';
const b = await chromium.launch(); const p = await b.newPage();
const res = await p.evaluate(async ({ hand, phone }) => {
  const load = async u => { const im = new Image(); im.src = u; await im.decode(); return im; };
  // 1) radio de las esquinas de la pantalla del iPhone (pantalla transparente)
  const ph = await load(phone);
  const c1 = document.createElement('canvas'); c1.width = ph.naturalWidth; c1.height = ph.naturalHeight;
  const g1 = c1.getContext('2d'); g1.drawImage(ph, 0, 0); const d1 = g1.getImageData(0, 0, c1.width, c1.height).data;
  const a = (x, y) => d1[(y * c1.width + x) * 4 + 3];
  const firstT = y => { for (let x = 150; x < 300; x++) if (a(x, y) < 30) return x; return -1; };
  const prof = []; for (let y = 108; y <= 175; y += 1) prof.push([y, firstT(y)]);
  // 2) mano sin el celular viejo: se vacía el cuerpo del teléfono, se conservan dedos, palma y el borde inferior
  const hd = await load(hand);
  const c2 = document.createElement('canvas'); c2.width = hd.naturalWidth; c2.height = hd.naturalHeight;
  const g2 = c2.getContext('2d'); g2.drawImage(hd, 0, 0);
  g2.globalCompositeOperation = 'destination-out';
  // arriba de los dedos se limpia un poco más ancho (restos del canto); a la altura de los dedos, justo el cuerpo
  g2.beginPath(); g2.roundRect(134, 90, 296 - 134, 244 - 90, [10, 10, 0, 0]); g2.fill();
  g2.fillRect(137, 240, 292 - 137, 390 - 240);
  return { prof, png: c2.toDataURL('image/png') };
}, { hand: 'data:image/png;base64,' + fs.readFileSync(A + 'mano-robot-celular.png').toString('base64'), phone: 'data:image/png;base64,' + fs.readFileSync(A + 'iphone-mockup.png').toString('base64') });
fs.writeFileSync(A + 'mano-robot-celular-sin-telefono.png', Buffer.from(res.png.split(',')[1], 'base64'));
console.log('perfil esquina pantalla (y, primer x transparente):', res.prof.filter((_, i) => i % 3 === 0).map(([y, x]) => `${y}:${x}`).join(' '));
await b.close();
