// Dibuja cada texto del video como PNG transparente al doble de tamaño: capas.html → capas/<id>.png
// Uso: node clientes/barbero-leaa/capas.mjs
import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(path.join(here, 'capas.html')).href);
await p.evaluate(() => document.fonts.ready);
for (const el of await p.$$('[data-id]')) {
  const id = await el.getAttribute('data-id');
  await el.screenshot({ path: path.join(here, 'capas', id + '.png'), omitBackground: true });
  console.log('ok', id);
}
await b.close();
