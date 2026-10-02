# Contexto para Claude

## Sobre Guille
- Guillermo (Guille), 19 años, Uruguay. Dueño de **Aicia** (@aicia_ia, Montevideo), agencia de IA: agentes de IA, automatizaciones, webs y apps.
- Respondé siempre en **español rioplatense**: claro, directo, corto, práctico y sin teoría larga.
- **No inventes datos.** No inventes clientes, métricas ni rubros. Si algo es de ejemplo, marcalo como "Vista de ejemplo". Si falta contexto, preguntá.
- Después de cada cambio: renderizá, revisá el resultado, hacé commit y push, y pasale las imágenes.

## Repo
- La raíz (`index.html`, `manifest.json`, `sw.js`) es **Guik**, una app de gimnasio aparte. No tocarla salvo que la pida.
- `historias/` contiene las **historias destacadas de Instagram de Aicia**, que es el trabajo actual.
- Rama de trabajo: `claude/eloquent-volta-h5jy6a`.

## Historias de Instagram (Aicia)

Hay 3 destacadas, como máximo: **Aicia**, **Clientes** y **Proyectos**.

| Carpeta | Qué es | Estado |
|---|---|---|
| `historias/destacada-aicia/` | 5 historias "¿Qué es Aicia?" (`destacada.html`) | **Final, aprobada** |
| `historias/clientes-proyectos/` | Portada de Clientes + 5 tarjetas de clientes + 2 de Proyectos (`historias.html`) | Clientes **final**. Portada de Proyectos **final**. Historias de proyecto pendientes |
| `historias/portadas-destacadas/` | Íconos de portada de las 3 destacadas (`portadas.html`) | **Final, aprobada** |
| `historias/que-es-aicia/` | 6 versiones viejas | No se usan, son solo referencia |

### Cómo renderizar (en tu compu)
```bash
cd historias
npm install                    # instala Playwright
npx playwright install chromium
node destacada-aicia/render.mjs        # 5 PNG + vista previa (--qa para control sin pisar)
node clientes-proyectos/render.mjs     # PNG con nombre según data-file + vista-previa.png
node portadas-destacadas/render.mjs    # portadas 2160×2160
# atajos: npm run aicia | npm run clientes | npm run portadas
```
- Las historias son HTML/CSS a 1080×1920. `render.mjs` las sirve con un servidor local, porque las máscaras CSS no funcionan con file://, y saca PNG.
- El QA automático revisa márgenes de texto (64–1016 px), zonas seguras de IG (y 250–1620), texto cortado y solapamientos.
- Las fuentes son locales, en `fonts/`: Geist, Geist Mono e Instrument Serif itálica.
- Si en tu máquina falla el WebGL (las esferas del logo), probá sacar los `args` de `chromium.launch` en `render.mjs`.

### Estilo (respetar siempre)
- Minimal, premium, tipo Apple. Fondo índigo oscuro.
- Paleta: noche `#06061A`, índigo `#4F46E5`, lavanda `#C7C9FF`.
- Grilla fina de cuadrados (celdas de ~120 px) que se desvanece hacia los bordes, más un grano sutil.
- Titular grande en Geist con **una sola** palabra o frase en serif itálica (Instrument Serif).
- Íconos: **solo contorno**, minimalistas.
- Imágenes recortadas (`.subj`) integradas con luz suave. La de Clientes va en blanco y negro (`.subj.mono`).
- **No usar** (Guille los pidió sacar): anillos u órbitas alrededor de las imágenes, numeración 01/05, stickers, cápsulas con el logo arriba, tono azul fuerte sobre las fotos ni degradés que corten imágenes.
- Filosofía de diseño completa en `historias/destacada-aicia/filosofia.md`. Ojo: la parte de la órbita ya no aplica.

### Destacada Aicia: textos finales
1. "Hola, somos Aicia." Hacemos que tu negocio funcione solo, con IA, automatizaciones, webs y apps.
2. "El problema…" / "Tu negocio, todo a mano." Lleva 4 tarjetas de dolor y cierra con "…te cuesta dinero y tiempo".
3. "¿Qué hacemos?" / "Tu negocio, en automático." Lleva un chat estilo WhatsApp clásico claro, marcado como "Vista de ejemplo".
   - Asistentes de IA: "Responden al instante, 24/7 y como una persona real."
   - Automatizaciones: "Las tareas repetitivas, hechas solas y sin errores."
   - Webs y apps: "A medida de tu negocio y conectadas a todo."
4. "Cómo trabajamos" / "Tres pasos. Sin vueltas."
   - Diagnóstico: "Encontramos dónde tu negocio pierde tiempo y/o dinero."
   - Implementación.
   - Resultados.
5. "¿Lo vemos para tu negocio?" Solo lleva el botón "Pedí tu demo", sin teléfono. La mano va en `top:910px`.
- Teléfono de Guille, si se necesita: +598 91 284 655.

### Destacada Clientes
- Portada: "Ellos ya *dieron el paso.*" sobre el apretón robot-humano en blanco y negro (`assets/apreton-robot-humano.png`).
- Los textos de clientes tienen que ser **genéricos**: a un cliente le pudo haber hecho un agente de IA, una automatización, una web o una app. No hay que afirmar qué servicio fue.
- Tarjeta: logo → línea → nombre → rubro → cápsula "Trabaja con **Aicia**" con el logo real de Aicia.

| Cliente | Rubro | Estilo del logo |
|---|---|---|
| FC Barber Shop | Barbería | `top:657px;width:400px` |
| Bs.As. Top Padel | Club de pádel | `top:628px;width:380px` |
| Fusion | Tienda de ropa | `top:627px;width:490px` |
| Alas Fit | Gimnasio | `top:653px;width:490px` |
| AeroSport | Club de pádel | `top:725px;width:580px` |

- Los tamaños están **equilibrados ópticamente** según el peso visual de cada logo, todos centrados en el eje y≈800. El nombre y el rubro quedan siempre en la misma posición.
- Para sumar un cliente:
  1. Pasá el logo por `preparar-logos.mjs` (logo negro → blanco y recorte).
  2. Duplicá una `<section>` de tarjeta con su propio `data-file`.
  3. Ajustá `top/width` hasta que tenga el mismo peso visual que los demás.
- El logo de AeroSport es de baja resolución. Si Guille consigue uno más grande, reemplazarlo.

### Pendiente
- **Proyectos**: portada "Lo que *construimos.*" con una **foto real** de dos manos levantando una MacBook (`assets/macbook-manos.png`, que sale de `macbook-manos-original.png` con `preparar-macbook.mjs`; ese script borra la pantalla verde y mide sus 4 esquinas). Encima de la pantalla va un sitio de Aicia premium y claro, calzado en perspectiva con `fitScreens()` (homografía → `matrix3d`): nav, "Tu negocio, en *automático.*" y una onda índigo difuminada. La foto lleva capas de integración en `.lap`: los negros levantados al índigo (`.blacks`, lighten), la caída de luz (`.falloff`, multiply), la luz de la pantalla sobre el teclado (`.spill`, screen), un resplandor detrás de la tapa (`.bloom-out`) y el brillo de la pantalla (`.lap-scr.bloom`). Están en intensidades bajas, porque más fuerte se ve lavado. La bajada es "Webs, apps, agentes de IA y automatizaciones hechos a medida de cada negocio." Se descartaron el logo grande, la vista explotada, el flujo n8n y el mosaico de ventanas. 
- **Proyectos · Bs.As. Top (web)**: historia en **video** `aicia-proyectos-02-bsas-top-web.mp4` (16 s, 1080×1920, 30 fps), con su PNG estático del mismo nombre. A propósito no repite la escena de la portada. Recorrido:
  1. **0–3,2 s:** Studio Display (`assets/studio-display.png`) con la web cargando. Texto: logo del club, "Proyecto · Página web", "Reservas *online.*" y la bajada.
  2. **3,2–4,4 s:** la cámara entra en la pantalla.
  3. **4,4–12,2 s:** la web de frente, con los títulos "Reservas en *pocos pasos.*" y "Todo el club, *a la vista.*".
  4. **12,2–13,5 s:** la web cae dentro del iPad sostenido por las manos (`assets/ipad-manos.png`). El pulgar queda delante de la pantalla.
  5. **Cierre:** "Hecha por *Aicia.*" y "¿Querés una web así para tu negocio? Escribinos."
- **Historias en video** (línea de tiempo):
  - `video-bsas.html` define la escena y `window.renderAt(t)`.
  - `bash preparar-cuadros-bsas.sh grabacion.mp4` saca los cuadros de la grabación a `.frames/bsas60/`, a 60 fps. No van al repo.
  - `node render-timeline.mjs video-bsas.html` hornea los dispositivos a 2x, graba 480 cuadros (unos 2 min) y arma el MP4 con grano.
  - `preparar-dispositivos.mjs` encuentra la pantalla de cada foto, mide las esquinas y la pinta de negro. La máscara del pulgar del iPad está medida a mano.
  - Fotos de mockups que pasó Guille y todavía no se usan: iPhone en la mano y ventana de vidrio flotante. Están en el chat, no en el repo.
- Pendiente opcional: una segunda historia de Bs.As. Top en imagen (por ejemplo, el paso de reservas en otro mockup). Máximo 2 historias por proyecto.
- Opcional: video de demo de un proyecto si Guille pasa grabaciones de pantalla.
