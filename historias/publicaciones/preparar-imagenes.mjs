// Prepara las imágenes recortadas de las publicaciones:
// las agranda al doble con buen filtrado y un enfoque suave, porque vienen a ~735 px y se muestran a ~1080 px.
// En el peón cambia el azul rey por el índigo de Aicia (#4F46E5), conservando las luces y las sombras.
// Uso: NODE_PATH=$(npm root -g) node preparar-imagenes.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const jobs = [
  { src: 'robot-estres-original.png', out: 'robot-estres.png' },
  { src: 'manos-ia-original.png', out: 'manos-ia.png' },
  { src: 'peon-azul-original.png', out: 'peon-indigo.png', indigo: true },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const j of jobs) {
  const data = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, j.src)).toString('base64');
  const png = await page.evaluate(async ({ data, indigo }) => {
    const img = new Image(); img.src = data; await img.decode();
    const W = img.width * 2, H = img.height * 2;
    const c = new OffscreenCanvas(W, H), x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, W, H);
    const id = x.getImageData(0, 0, W, H), d = id.data;
    // Enfoque suave (máscara de enfoque con desenfoque de caja 3×3) solo en el color, el borde queda igual
    const src = new Uint8ClampedArray(d), A = .55;
    for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) {
      const i = (y * W + xx) * 4; if (src[i + 3] < 8) continue;
      for (let k = 0; k < 3; k++) {
        let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += src[i + (dy * W + dx) * 4 + k];
        d[i + k] = src[i + k] + A * (src[i + k] - s / 9);
      }
    }
    if (indigo) {
      // Azul rey (tono ~223°) → índigo de Aicia (~243°). Pesa por saturación: los peones negros casi no cambian
      const rgb2hsl = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l];
        const dd = mx - mn, s = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn);
        const h = mx === r ? ((g - b) / dd + (g < b ? 6 : 0)) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; return [h * 60, s, l]; };
      const hsl2rgb = (h, s, l) => { const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, t = h / 360;
        const f = u => { u = (u + 1) % 1; return u < 1 / 6 ? p + (q - p) * 6 * u : u < .5 ? q : u < 2 / 3 ? p + (q - p) * (2 / 3 - u) * 6 : p; };
        return [f(t + 1 / 3), f(t), f(t - 1 / 3)]; };
      const sm = (a, b, v) => { const u = Math.min(1, Math.max(0, (v - a) / (b - a))); return u * u * (3 - 2 * u); };
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 4) continue;
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        const [h, s, l] = rgb2hsl(r, g, b);
        const w = sm(.12, .4, s) * sm(170, 200, h) * (1 - sm(265, 290, h));
        if (!w) continue;
        const [r2, g2, b2] = hsl2rgb(h + 19, s * .8, Math.pow(l, .78));
        d[i] = (r + (r2 - r) * w) * 255; d[i + 1] = (g + (g2 - g) * w) * 255; d[i + 2] = (b + (b2 - b) * w) * 255;
      }
    }
    x.putImageData(id, 0, 0);
    const blob = await c.convertToBlob({ type: 'image/png' });
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
    for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768));
    return btoa(s);
  }, { data, indigo: !!j.indigo });
  fs.writeFileSync(path.join(dir, j.out), Buffer.from(png, 'base64'));
  console.log('ok', j.out);
}
await browser.close();
