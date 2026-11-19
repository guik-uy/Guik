// Render de las piezas de Catoira: sirve el repo en local, saca cada <section data-file> al doble y la achica con lanczos.
// Uso: node clientes/catoira/render.mjs <html relativo a clientes/catoira> [--rapido] [--solo texto] [--prueba]
//   --rapido: 1x, sin achicar · --solo: solo las secciones cuyo data-file contiene ese texto · --prueba: además saca
//   las versiones "-prueba" de las que marcan zonas (portadas de Facebook y WhatsApp).
// QA: data-safe="x0,y0,x1,y1" (todo el texto adentro), data-avoid="x0,y0,x1,y1" (zona sin texto, ej. foto de perfil de FB),
//   data-circle="cx,cy,r" (círculo sin texto, foto de perfil de WhatsApp). También avisa texto cortado o columna desbordada.
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..', '..');
const args = process.argv.slice(2), rapido = args.includes('--rapido'), prueba = args.includes('--prueba');
const solo = args.includes('--solo') ? args[args.indexOf('--solo') + 1] : null;
const html = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--solo');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const rel = path.relative(root, path.join(here, html)).split(path.sep).join('/'), outDir = path.dirname(path.join(here, html));
const browser = await chromium.launch(); const dsf = rapido ? 1 : 2;
let fallas = 0;
for (const modo of prueba ? ['', '?prueba'] : ['']) {
  const page = await browser.newPage({ viewport: { width: 2200, height: 2000 }, deviceScaleFactor: dsf });
  await page.goto(`http://127.0.0.1:${server.address().port}/${rel}${modo}`); await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.querySelector('[data-sym]') || document.body.dataset.ready, null, { timeout: 10000 });
  for (const s of await page.$$('section[data-file]')) {
    let file = await s.getAttribute('data-file');
    if (solo && !file.includes(solo)) continue;
    if (modo) { if (!(await s.$('.safe'))) continue; file = file.replace(/\.png$/, '-prueba.png'); }
    else {
      const qa = await s.evaluate(sec => {
        const o = [], b = sec.getBoundingClientRect(), num = a => a.split(',').map(Number);
        if (sec.hasAttribute('data-noqa')) return o;
        const safe = sec.dataset.safe && num(sec.dataset.safe), avoid = sec.dataset.avoid && num(sec.dataset.avoid), circ = sec.dataset.circle && num(sec.dataset.circle);
        const walk = n => {
          for (const c of n.childNodes) {
            if (c.nodeType === 3 && c.textContent.trim()) {
              const r = document.createRange(); r.selectNodeContents(c);
              for (const q of r.getClientRects()) {
                const x0 = q.left - b.left, y0 = q.top - b.top, x1 = q.right - b.left, y1 = q.bottom - b.top, t = c.textContent.trim().slice(0, 24);
                if (safe && (x0 < safe[0] - .5 || y0 < safe[1] - .5 || x1 > safe[2] + .5 || y1 > safe[3] + .5)) o.push(`fuera de zona segura: "${t}" (${x0 | 0},${y0 | 0}–${x1 | 0},${y1 | 0})`);
                if (avoid && x1 > avoid[0] && x0 < avoid[2] && y1 > avoid[1] && y0 < avoid[3]) o.push(`en zona tapada: "${t}"`);
                if (circ) { const dx = Math.max(x0 - circ[0], 0, circ[0] - x1), dy = Math.max(y0 - circ[1], 0, circ[1] - y1); if (Math.hypot(dx, dy) < circ[2]) o.push(`toca la foto de perfil: "${t}"`); }
              }
            } else if (c.nodeType === 1 && !c.matches('.safe,.no')) {
              if (c.scrollHeight > c.clientHeight + 2 && getComputedStyle(c).overflow === 'hidden') o.push('texto cortado en ' + c.className);
              walk(c);
            }
          }
        };
        walk(sec);
        const col = sec.querySelector('.col');
        if (col) { const last = [...col.children].at(-1).getBoundingClientRect(), cb = col.getBoundingClientRect(); if (last.bottom > cb.bottom + 1) o.push(`el contenido se pasa de la columna (${Math.round(last.bottom - cb.bottom)} px)`); }
        return [...new Set(o)];
      });
      if (qa.length) { fallas++; console.log('QA ' + file + ':\n  ' + qa.join('\n  ')); }
    }
    const { width: w, height: h } = await s.boundingBox(), out = path.join(outDir, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (rapido) await s.screenshot({ path: out });
    else {
      const raw = out + '.raw.png'; await s.screenshot({ path: raw });
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', `scale=${Math.round(w)}:${Math.round(h)}:flags=lanczos+accurate_rnd+full_chroma_int`, '-pix_fmt', 'rgb24', out]);
      fs.unlinkSync(raw);
    }
    console.log('ok', file, `${Math.round(w)}×${Math.round(h)}`);
  }
  await page.close();
}
console.log(fallas ? `QA: ${fallas} pieza(s) con avisos` : 'QA: ok');
await browser.close(); server.close();
