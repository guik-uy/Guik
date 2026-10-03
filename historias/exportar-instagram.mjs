// Exporta TODO lo de Instagram de Aicia, listo para subir, en historias/instagram/ (+ aicia-instagram.zip y una versión solo con imágenes).
// Cada pieza se dibuja al doble de resolución y se achica con lanczos (texto y bordes más limpios), en PNG RGB sin transparencia.
// Uso: NODE_PATH=$(npm root -g) node exportar-instagram.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'instagram');
fs.rmSync(out, { recursive: true, force: true });

const F = { perfil: '1-foto-de-perfil', aicia: '2-destacada-aicia', clientes: '3-destacada-clientes', proyectos: '4-destacada-proyectos', posts: '5-publicaciones' };
const jobs = [
  { page: 'logo-perfil/logo.html', sel: 'section.sq.perfil', size: [1080, 1080], to: () => [F.perfil, 'aicia-logo-perfil.png'] },
  { page: 'destacada-aicia/destacada.html', sel: 'section.story', size: [1080, 1920], to: (i) => [F.aicia, `aicia-destacada-0${i + 1}.png`] },
  { page: 'clientes-proyectos/historias.html', sel: 'section.story', size: [1080, 1920], to: (i, f) => [f.includes('proyectos') ? F.proyectos : F.clientes, f] },
  { page: 'portadas-destacadas/portadas.html', sel: 'section.sq', size: [1080, 1080], to: (i, f) => [F[f.replace('portada-', '').replace('.png', '')], '0-portada-de-la-destacada.png'] },
  { page: 'publicaciones/publicaciones.html', sel: 'section.post.dark', size: [1080, 1350], to: (i) => [F.posts, ['1-no-es-tu-equipo.png', '2-potenciado-con-ia.png', '3-diferenciate.png'][i]] },
];

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });

const tmp = path.join(out, '.tmp.png');
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: 1300, height: 2100 }, deviceScaleFactor: 2 });
  page.on('pageerror', e => console.log('[error]', e.message));
  await page.goto(base + j.page);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 180000 });
  const err = await page.evaluate(() => window.__error);
  if (err) { console.error('Error en', j.page, err); process.exit(1); }
  await page.evaluate(() => document.fonts.ready);
  for (const [i, el] of (await page.$$(j.sel)).entries()) {
    const [folder, name] = j.to(i, (await el.getAttribute('data-file')) || '');
    fs.mkdirSync(path.join(out, folder), { recursive: true });
    await el.screenshot({ path: tmp });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `scale=${j.size[0]}:${j.size[1]}:flags=lanczos+accurate_rnd+full_chroma_int`, '-pix_fmt', 'rgb24', path.join(out, folder, name)]);
    console.log('ok', path.join(folder, name));
  }
  await page.close();
}
fs.rmSync(tmp, { force: true });
await browser.close();
server.close();

// El video ya está terminado: se copia tal cual (1080×1920, 30 fps, H.264, bt709)
fs.copyFileSync(path.join(root, 'clientes-proyectos', 'aicia-proyectos-02-bsas-top-web.mp4'), path.join(out, F.proyectos, 'aicia-proyectos-02-bsas-top-web.mp4'));
console.log('ok', path.join(F.proyectos, 'aicia-proyectos-02-bsas-top-web.mp4'));

execFileSync('zip', ['-q', '-r', '-X', 'aicia-instagram.zip', ...Object.values(F)], { cwd: out });
// Solo imágenes (sin el video): pesa menos de la mitad, para mandarlo por chat
execFileSync('zip', ['-q', '-r', '-X', 'aicia-instagram-imagenes.zip', ...Object.values(F), '-x', '*.mp4'], { cwd: out });
console.log('ok aicia-instagram.zip y aicia-instagram-imagenes.zip');
