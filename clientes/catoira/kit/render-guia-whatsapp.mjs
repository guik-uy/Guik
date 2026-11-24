// Render de la guía de WhatsApp Business para Fernando: kit/guia-whatsapp-fernando.html → kit/guia-whatsapp-fernando.pdf (A4).
// Uso: node clientes/catoira/kit/render-guia-whatsapp.mjs
import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(here, 'guia-whatsapp-fernando.html')).href);
await page.evaluate(() => document.fonts.ready);
const out = path.join(here, 'guia-whatsapp-fernando.pdf');
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('ok', out);
