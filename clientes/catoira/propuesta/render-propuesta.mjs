// Render de la propuesta de reels: propuesta/propuesta-reels.html → propuesta/propuesta-reels-catoira.pdf (A4).
// Uso: node clientes/catoira/propuesta/render-propuesta.mjs  · Avisa si alguna página se desborda.
import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto(pathToFileURL(path.join(here, 'propuesta-reels.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
const qa = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
  const b = p.getBoundingClientRect(); const pie = p.querySelector('.pie'); const lim = pie ? pie.getBoundingClientRect().top : b.bottom;
  let max = 0; p.querySelectorAll('*').forEach(e => { if (e.closest('.pie') || e === p) return; const r = e.getBoundingClientRect(); if (r.height) max = Math.max(max, r.bottom); });
  return max > lim + 1 ? `página ${i + 1}: se pasa ${Math.round(max - lim)} px` : null;
}).filter(Boolean));
console.log(qa.length ? 'QA:\n  ' + qa.join('\n  ') : 'QA: ninguna página se desborda');
const out = path.join(here, 'propuesta-reels-catoira.pdf');
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('ok', out);
