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
| `historias/clientes-proyectos/` | Portada de Clientes + 5 tarjetas de clientes + 2 de Proyectos (`historias.html`) | Clientes **final**. Portada de Proyectos **a revisar**. Tarjeta de Proyectos pendiente |
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
- **Proyectos**: portada "Lo que *construimos.*" con una MacBook. En la pantalla hay un flujo de automatización tipo n8n (WhatsApp → Agente IA → Agenda y Planilla → Confirmación). Guille pidió sacar el logo grande y el dock que había antes; también descartó la versión de capas "De la idea a lo real". El resto de la destacada la quiere "diferente": esperar su idea antes de diseñar. La tarjeta Bs.As. Top (web) sigue como placeholder.
- Opcional: video de demo de un proyecto si Guille pasa grabaciones de pantalla.
