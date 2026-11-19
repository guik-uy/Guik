// Pasa los SVG del símbolo a PNG sin fondo (2000 px de ancho), para la carpeta de entrega.
// Uso: node clientes/catoira/logo/exportar-png.mjs  → logo/png/simbolo-*.png
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'png');
fs.mkdirSync(out, { recursive: true });
const W = 2000, H = Math.round(W * 910 / 992), PAD = 0.06;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const n of ['degrade', 'blanco', 'petroleo']) {
  const svg = fs.readFileSync(path.join(dir, `simbolo-${n}.svg`), 'utf8');
  await page.setContent(`<html><body style="margin:0;background:transparent">
    <div style="width:${W}px;height:${H}px;display:grid;place-items:center">
    <div style="width:${W * (1 - 2 * PAD)}px">${svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></div></body></html>`);
  const f = path.join(out, `simbolo-${n}.png`);
  await page.screenshot({ path: f, omitBackground: true });
  console.log('ok', f);
}
await browser.close();
