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
| `historias/clientes-proyectos/` | Portada de Clientes + 5 tarjetas de clientes + Proyectos: portada, video de Bs.As. Top y "Próximamente" (`historias.html`, `video-bsas.html`) | Clientes **final**. Proyectos: portada y video **finales**, "Próximamente" esperando el OK de Guille |
| `historias/portadas-destacadas/` | Íconos de portada de las 3 destacadas (`portadas.html`) | **Final, aprobada** |
| `historias/que-es-aicia/` | 6 versiones viejas | No se usan, son solo referencia |
| `historias/logo-perfil/` | Logo de Aicia para la foto de perfil, 1080×1080 (`logo.html`) | Círculos en el índigo de los íconos de las historias (y variante lavanda) sobre el fondo de las historias, esperando el OK de Guille |
| `historias/publicaciones/` | 3 publicaciones del feed, 1080×1350 (`publicaciones.html`). Versión azul (la elegida) y clara | Azul en pulido final |

### Cómo renderizar (en tu compu)
```bash
cd historias
npm install                    # instala Playwright
npx playwright install chromium
node destacada-aicia/render.mjs        # 5 PNG + vista previa (--qa para control sin pisar)
node clientes-proyectos/render.mjs     # PNG con nombre según data-file + vista-previa.png
node portadas-destacadas/render.mjs    # portadas 2160×2160
node publicaciones/render.mjs          # 3 publicaciones 1080×1350 + vista previa del feed
node logo-perfil/render.mjs            # logo de perfil 1080×1080 (plano y 3D) + vista previa en círculo
node exportar-instagram.mjs            # TODO listo para subir → historias/instagram/ + aicia-instagram.zip
# atajos: npm run aicia | npm run clientes | npm run portadas | npm run publicaciones | npm run logo | npm run instagram
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

### Publicaciones del feed (`historias/publicaciones/`)
- Son la **versión clara** del estilo Aicia, para el feed. Siguen las referencias que pasó Guille: fondo blanco, titular grande y una foto recortada.
  - Fondo papel frío con luz lavanda detrás del protagonista, grilla índigo muy suave y grano.
  - Titular en Geist: la primera línea en gris y la segunda en negro, con **una** palabra en Instrument Serif itálica índigo.
  - Botón índigo con flecha.
  - Abajo va "aicia" centrado, como en las historias, y el logo en la esquina inferior derecha. Para que quede parejo, en la esquina inferior izquierda va "AGENCIA DE IA" en mono (en blanco con `.on-dark` cuando cae sobre la foto). Guille pidió **sacar el @ de arriba**.
  - En la del robot, la foto está más cerca a propósito, para que la firma caiga entre las piernas y el logo entre las del robot.
  - Fotos en blanco y negro, con el índigo como único color.
- Formato 1080×1350 (4:5). El texto va dentro de 80–1000 px porque la grilla del perfil recorta los costados a 3:4.
- Publicaciones:
  1. **"El problema no es tu *equipo.*"**: "Es seguir haciendo todo a mano.", con el botón "Automatizá lo repetitivo". Usa `assets/robot-estres.png`.
  2. **"Tu negocio, potenciado con *IA.*"**: "Agentes de IA, automatizaciones, webs y apps a medida.", con el botón "Pedí tu demo". Usa `assets/manos-ia.png` en blanco y negro, con una luz índigo suave entre los dedos (sin punto: Guille pidió sacarlo).
  3. **"No seas uno *más.*"**: "Mientras todos hacen lo mismo, vos das el paso.", con el botón "Destacate con IA". Usa `assets/peon-indigo.png`.
- **Versión fondo azul** (`*-azul.png`, secciones `.post.dark`): es **la que eligió Guille** ("me gusta más azul"). Pidió que fuera premium y minimalista, **igual que las historias**, así que tiene la misma estructura:
  - Arriba, el título en blanco con una frase en serif lavanda y una bajada corta. **Sin etiqueta arriba**: Guille sacó "El problema…", "La solución" y "El resultado".
  - Abajo, la foto grande con tinte índigo y luz de borde, fundida en el oscurecido (`.basefade`).
  - El bloque de texto mide y se ubica igual en las 3 (`.dark .title/.lede`).
  - **Ninguna lleva botón** (Guille sacó también "Pedí tu demo" de la 2). El estilo `.dark .pill.cta` queda en el CSS por si se necesita.
  - Pie: "AGENCIA DE IA", "aicia" y el logo blanco.
  - Textos:
    1. "No es tu equipo. Es hacer todo *manual.*" (en 3 líneas, con "manual." sola en serif) / "Lo repetitivo se automatiza. **Tu equipo, a lo importante.**"
    2. "Tu negocio, potenciado *con IA.*" / "Agentes de IA, automatizaciones, webs y apps **a medida de tu negocio.**". Las manos van sin punto ni resplandor entre los dedos.
    3. "Diferenciate de la *competencia.*" / "Que tu negocio **no sea uno más.**" (la eligió Guille; descartó "vos das el paso" y "salir del montón").
- La versión clara (sin sufijo) quedó como estaba, con el gris en la primera línea del título y un botón índigo en cada una.
- `preparar-imagenes.mjs` agranda al doble los recortes de Guille (`*-original.png`) con un enfoque suave, y pasa el peón de azul rey al índigo de Aicia.

### Logo de perfil (`historias/logo-perfil/`)
- **Versión actual (`aicia-logo-perfil.png`):** Guille pidió que el logo quedara **exactamente igual** a su foto de perfil, con los círculos sin tocar, y que lo premium estuviera en el fondo.
  - **Círculos:** misma forma, posición y tamaño que el original. Su imagen es el logo dibujado en un cuadro de 1024,6 unidades, por eso `viewBox 0 0 1024.6 1024.6`. Guille dio el OK para cambiar el color, pero **blanco no**.
    - Principal: el **índigo de los íconos de las historias** (`ap-indigo`: #8689FF → #5B52F0 → #4232CC, vertical), con un resplandor índigo suave.
    - Variante: `aicia-logo-perfil-lavanda.png`, en lavanda como las etiquetas de las historias (#D9DAFF → #9A9BFA).
  - **Fondo:** con **los colores de las historias y las publicaciones**, como pidió Guille. Es noche índigo (#05051A → #090924 → #100E36), con la luz índigo rgba(79,70,229,.62) arriba a la izquierda del logo (40 % / 40 %) y un toque índigo en la esquina superior izquierda.
  - **Lo que le suma:**
    - un rebote índigo suave detrás del logo;
    - una sombra de contacto abajo;
    - la grilla fina de las historias, desvanecida;
    - un resplandor índigo leve alrededor de los círculos;
    - grano sutil.
  - Se dibuja a 2160 y se achica a **1080×1080** con lanczos.
- **Logo de texto** (pedido de Guille: "un logo que diga aicia nomás"): "aicia" igual que la firma de abajo de las historias y publicaciones, en Geist 600, -0,035em y blanco.
  - `aicia-logo-texto.png` (1080×1080): Guille pidió que fuera "más premium, como en las historias". Lleva el escenario de las historias:
    - luz índigo desde abajo (50 % / 62 %), grilla que se desvanece, viñeta y grano;
    - letras con degradé blanco → lavanda (#FFFFFF → #F3F3FF → #C9CBFF) y un halo índigo suave;
    - más aire alrededor: la tinta ocupa ~46 % del ancho.
  - `aicia-logo-texto-transparente.png` (1600×700): sin fondo, con el mismo degradé, para usar en cualquier lado.
  - Se centra por la caja real de las letras, medida con canvas en `placeWordmarks()`. `data-ink` fija el ancho de la tinta.
  - `render.mjs` acepta `data-size` y `data-transparent` por sección. La fuente Geist está en `logo-perfil/fonts/`.
- Versiones anteriores, descartadas: el logo plano con luz y borde lavanda sobre el fondo de las historias, y la de esferas 3D (`aicia-logo-perfil-3d.png`, que queda de referencia).
- La vista previa lo muestra en círculo a 300, 150, 110, 77, 56 y 32 px.

### Exportación para Instagram (`exportar-instagram.mjs`)
- Junta todo lo final en `historias/instagram/` (no va al repo, se regenera). Arma `aicia-instagram.zip` (35 MB, con el video) y `aicia-instagram-imagenes.zip` (19 MB, sin el video: el chat no acepta archivos de más de ~30 MB).
- Cada pieza se dibuja al **doble de resolución** y se achica con lanczos. Sale en PNG RGB sin transparencia, con el diseño idéntico al aprobado.
- Carpetas, en orden:
  1. `1-foto-de-perfil`: el logo, 1080×1080.
  2. `2-destacada-aicia`: la portada de la destacada (1080×1080) y las 5 historias.
  3. `3-destacada-clientes`: la portada y las 6 historias.
  4. `4-destacada-proyectos`: la portada, la historia de portada, el MP4 de Bs.As. Top (se copia tal cual) y "Próximamente".
  5. `5-publicaciones`: las 3 azules, 1080×1350.

### Pendiente
- **Proyectos**: portada "Lo que *construimos.*" con una **foto real** de dos manos levantando una MacBook (`assets/macbook-manos.png`, que sale de `macbook-manos-original.png` con `preparar-macbook.mjs`; ese script borra la pantalla verde y mide sus 4 esquinas). Encima de la pantalla va un sitio de Aicia premium y claro, calzado en perspectiva con `fitScreens()` (homografía → `matrix3d`): nav, "Tu negocio, en *automático.*" y una onda índigo difuminada. La foto lleva capas de integración en `.lap`: los negros levantados al índigo (`.blacks`, lighten), la caída de luz (`.falloff`, multiply), la luz de la pantalla sobre el teclado (`.spill`, screen), un resplandor detrás de la tapa (`.bloom-out`) y el brillo de la pantalla (`.lap-scr.bloom`). Están en intensidades bajas, porque más fuerte se ve lavado. La bajada es "Webs, apps, agentes de IA y automatizaciones hechos a medida de cada negocio." Se descartaron el logo grande, la vista explotada, el flujo n8n y el mosaico de ventanas. 
- **Proyectos · Bs.As. Top (web)**: historia en **video** `aicia-proyectos-02-bsas-top-web.mp4` (27 s, 1080×1920, 30 fps), con su PNG estático del mismo nombre. A propósito no repite la escena de la portada. Guille la aprobó y pidió solo pulirla, sin cambiar los movimientos. Recorrido:
  1. **0–3 s:** Studio Display (`assets/studio-display.png`). La web **arranca recargándose**, como pidió Guille: fondo solo → aparece el inicio con su animación. Texto: logo del club, "Proyecto · Página web", "Reservas *online.*" y la bajada.
  2. **3–4,4 s:** la cámara entra en la pantalla. La web queda pegada al monitor hasta la mitad del viaje (io4), se endereza y se asienta un 1,2 %.
  3. **4,4–22,6 s:** una **reserva completa**, sacada de la grabación `2026-10-02_20-10-58.mp4` (datos de prueba: Juan Perez): turno (viernes 22:30) → Cancha 2 → datos → seña de $24.000 con Mercado Pago → turno confirmado.
     - Un título por paso: "Elegí día y *horario.*", "Elegí la *cancha.*", "Completá tus *datos.*", "Seña con *Mercado Pago.*" y "Reserva *confirmada.*".
     - La carga de datos va casi a velocidad real, porque Guille quiere que se vea (no hay nada privado). Se saltea el cuadro en negro que hace la web al cambiar de paso.
     - Zoom **mínimo** dentro de la página (`PCAM`, 1,00–1,08): Guille pidió no hacer tanto zoom. El formulario se ve completo, con el botón.
     - Los cortes llevan un pestañeo a oscuro.
     - Se saltea la página de Mercado Pago.
  4. **22,6–23,1 s:** la página vuelve arriba.
  5. **23,1–24,4 s:** la web entra en el monitor de frente (`assets/monitor-frente.png`), que pasa de desenfocado a nítido.
  6. **Cierre:** "Hecha por *Aicia.*" y "¿Querés una web así para tu negocio? Escribinos."
  - Los textos entran y salen con desenfoque suave.
- **Historias en video** (línea de tiempo):
  - `video-bsas.html` define la escena y `window.renderAt(t)`.
  - `bash preparar-cuadros-bsas.sh grabacion.mp4` saca los tramos de la grabación a `.frames/bsas3/`, a 60 fps, con el número de cuadro absoluto (`CLIPS` decide el ritmo). No van al repo.
  - `node render-timeline.mjs video-bsas.html [--fresh]` hornea los dispositivos a 2x y graba ~820 cuadros (la duración sale de `window.DUR`). Tarda unos 25–30 min y se puede cortar y retomar.
  - Calidad final, pedida por Guille:
    - Cada cuadro se dibuja **al doble de resolución** y ffmpeg lo achica con lanczos.
    - **Desenfoque de movimiento real** en `window.MBLUR`: entrada, scroll, tramo rápido y salida, promediando 4 instantes con obturador de 180°.
    - **Fundido entre cuadros contiguos** de la grabación, para la cámara lenta sin saltos.
    - **Remapeo de tiempo** y **cámara de página** con curvas monótonas (Fritsch–Carlson), así la velocidad nunca cambia de golpe.
    - MP4 x264 con crf 12, preset veryslow, tune film y aq-mode 3 (cuida los fondos oscuros). Pesa unos 23 MB, porque el chat no acepta más de ~30 MB.
    - **Sin grano en movimiento.** Guille dijo que el video "se veía mal": ese grano Instagram lo convierte en bloques.
    - Enfoque suave (`unsharp` 0,35) para que el texto aguante la recompresión de Instagram.
    - Sin `--fresh`, si los cuadros ya están, solo re-codifica (~1 min). Se ajusta con `--crf` y `--sharp`.
  - `preparar-dispositivos.mjs` encuentra la pantalla de cada foto, mide las esquinas y la pinta de negro. La máscara del pulgar del iPad está medida a mano.
  - Fotos de mockups que pasó Guille y todavía no se usan: iPhone en la mano y ventana de vidrio flotante (están en el chat, no en el repo), y el iPad con manos (`assets/ipad-manos*.png`, listo y con la máscara del pulgar).
- **Proyectos · Próximamente** (`aicia-proyectos-03-proximamente.png`, sección `.p3`): va después del video, así la destacada no muestra un solo proyecto, como pidió Guille.
  - "Próximamente" / "Lo que *se viene.*" / "Más proyectos, testimonios y novedades."
  - Debajo van 3 tarjetas de vidrio compactas con ícono y la marca "pronto": Nuestra página web, Testimonios y Más proyectos.
  - Abajo, como imagen protagonista, el **filósofo de mármol con la laptop** que pasó Guille. Va en blanco y negro (`.subj.mono`), con tinte índigo y luz de borde.
    - `assets/filosofo-laptop.png` sale de `filosofo-laptop-original.jpg` (fondo blanco) con `preparar-filosofo.mjs`.
    - Ese script hace un relleno desde el borde más los huecos blancos grandes, suaviza el borde quitándole el blanco (así no queda halo) y agranda al doble.
  - Sin fechas ni números, para no prometer nada que no esté.
  - Cuando haya testimonios o proyectos nuevos, se reemplaza.
- Tarjetas de FC Barber Shop tipo billete de $2.000 ("¿Pensaste que era plata?"): Guille las mostró. La recomendación fue no sumarlas a Proyectos como diseño suelto. Solo entran si el QR lleva a algo que hizo Aicia (reservas o agente), contado como "del papel a la reserva". Ojo: imitan un billete real.
- Pendiente opcional: una segunda historia de Bs.As. Top en imagen (por ejemplo, el paso de reservas en otro mockup). Máximo 2 historias por proyecto.
- Opcional: video de demo de un proyecto si Guille pasa grabaciones de pantalla.
