# Contexto para Claude

## Sobre Guille
- Guillermo (Guille), 19 años, Uruguay. Dueño de **Aicia** (@aicia_ia, Montevideo), agencia de IA: agentes de IA, automatizaciones, webs y apps.
- Respondé siempre en **español rioplatense**: claro, directo, corto, práctico y sin teoría larga.
- **No inventes datos.** No inventes clientes, métricas ni rubros. Si algo es de ejemplo, marcalo como "Vista de ejemplo". Si falta contexto, preguntá.
- Después de cada cambio: renderizá, revisá el resultado, hacé commit y push, y pasale las imágenes.

## Repo
- La raíz (`index.html`, `manifest.json`, `sw.js`) es **Guik**, una app de gimnasio aparte. No tocarla salvo que la pida.
- `historias/` contiene las **historias destacadas de Instagram de Aicia**, que es el trabajo actual.
- `aicia-web/` es la **página web de Aicia** (ver "Web de Aicia" más abajo).
- Rama de trabajo: `claude/eloquent-volta-h5jy6a`.

## Historias de Instagram (Aicia)

Hay 3 destacadas, como máximo: **Aicia**, **Clientes** y **Proyectos**.

| Carpeta | Qué es | Estado |
|---|---|---|
| `historias/destacada-aicia/` | 5 historias "¿Qué es Aicia?" (`destacada.html`) | **Final, aprobada** |
| `historias/clientes-proyectos/` | Portada de Clientes + 5 tarjetas de clientes + testimonio de Bs.As. Top + Proyectos: portada, video de Bs.As. Top, video de las tarjetas de FC Barber Shop y "Próximamente" (`historias.html`, `video-bsas.html`, `video-barber.html`) | Clientes **final**; testimonio esperando el OK de Guille. Proyectos: portada y video de Bs.As. Top **finales**; video de las tarjetas y "Próximamente" esperando el OK de Guille |
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
- **Orden** (pedido de Guille, el número del archivo es el orden de subida): 01 portada → 02 Bs.As. Top Padel → **03 testimonio de Bs.As. Top** → 04 FC Barber Shop → 05 Fusion → 06 Alas Fit → 07 AeroSport.
- **Testimonio de Bs.As. Top** (`aicia-clientes-03-bsas-top-testimonio.png`, sección `.testi`): va justo después de la tarjeta del club. Centrado como las tarjetas:
  - comillas grandes en Instrument Serif lavanda;
  - la frase textual que pasó Guille como titular: "Excelente la atención y el *servicio.*";
  - línea, y abajo el logo del club **suelto, sin contorno** (Guille pidió sacar el cuadro de vidrio) con "Bs.As. Top Padel" / "Club de pádel".
  - Se atribuye al club: sin nombre de persona, sin estrellas ni puntajes (no los dio). Sin etiqueta arriba: las comillas ya dicen que es un testimonio.
  - Para sumar otro testimonio: duplicá la sección `.testi`, cambiá la frase (textual, la que pase Guille), el logo y el `data-file`, y ubicala después de la tarjeta de ese cliente.

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
  3. `3-destacada-clientes`: la portada y las 7 historias (con el testimonio de Bs.As. Top).
  4. `4-destacada-proyectos`: la portada, la historia de portada, los MP4 de Bs.As. Top y de las tarjetas de FC Barber Shop (se copian tal cual) y "Próximamente". Las versiones fijas de las tarjetas (`estatica`) no se exportan.
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
- **Orden de Proyectos** (el número del archivo es el orden de subida): 01 portada → 02 video de Bs.As. Top → 03 video de las tarjetas de FC Barber Shop → 04 Próximamente.
- **Proyectos · FC Barber Shop · Tarjetas (video)** (`video-barber.html` → `aicia-proyectos-03-fc-barber-tarjetas.mp4`, 19,4 s, y su PNG fijo del segundo 3,2): Guille pidió "un video tipo el de Bs.As. Top mostrando las tarjetas, bien premium", con referencias de tarjetas flotando en un espacio oscuro (luz suave, sombras largas, cámara lenta). Reemplaza a las 2 historias fijas.
  - Las tarjetas son **objetos 3D reales** en CSS: dos caras (billete y dorso), canto de papel de tres láminas, y una luz que se calcula según el ángulo de cada cara (sombreado + banda de brillo que barre el papel al girar). Una sombra suave las sigue y hay una luz índigo detrás.
  - **Movimiento** (segunda versión, Guille pidió mejorar transiciones y movimientos): se midió el movimiento cuadro a cuadro y había frenadas en seco entre tramos, tirones en el giro y el acercamiento, y un pico amontonado al alejarse (giro + entrada de las dos verticales a la vez). Ahora:
    - cada parámetro de cada tarjeta sigue una **curva continua** (Fritsch–Butland, `smooth()`): nunca queda congelada, deriva un poco mientras se lee y los movimientos grandes arrancan y frenan suave;
    - el giro, el acercamiento al QR y el alejamiento duran 2–2,4 s;
    - las verticales entran **escalonadas**, cuando la horizontal ya está frenando;
    - **paneo lento de cámara** todo el video (`#rig`, de -3° a +3°) que da profundidad entre las tarjetas, y un empuje final que sigue en movimiento hasta el último cuadro.
  - Recorrido:
    1. **0–4,5 s:** la tarjeta horizontal sube desde fuera de cuadro mostrando el billete. Logo de FC Barber, "Proyecto · Tarjetas", "¿Pensaste que era *plata?*" y "Tarjetas para FC Barber Shop con forma de billete de $2.000."
    2. **4,3–8 s:** gira sobre su eje (2 s) y muestra el dorso negro. "Del otro lado, *el turno.*" / "Teléfono, Instagram y las dos direcciones."
    3. **7,9–11,2 s:** la cámara va al QR en 2 s (×2,6, con el dorso en alta: `horizontal-dorso-negro-video.jpg`, 4800 px). "Un QR para *reservar.*"
    4. **10,9–15,5 s:** se aleja y vuelve a mostrar el billete (2,4 s); las dos verticales (dorso blanco y negro) entran a los 12,3 y 12,6 s. "Dos formatos, *dos colores.*" / "Horizontal y vertical, con dorso blanco o negro."
    5. **15,8–19,4 s:** las tres flotan con un empuje lento de cámara. "Diseñadas por *Aicia.*" / "¿Querés tarjetas así para tu negocio? Escribinos."
  - **Borradores:** Guille pidió ir viendo demos livianas hasta que el video quede perfecto, y recién ahí la calidad final. `node render-timeline.mjs video-barber.html --demo` → `.video-out/aicia-proyectos-03-fc-barber-tarjetas-demo.mp4` (540×960, sin desenfoque de movimiento, ~0,7 MB, ~2 min).
  - Calidad final, solo con el OK: `node render-timeline.mjs video-barber.html --fresh --sub 6 --poster 3.2` (desenfoque de movimiento con 6 instantes en los giros, para que no se vean copias).
  - Las tarjetas no usan opacidad parcial a propósito: aplanaría el 3D. Entran desde fuera de cuadro.
  - **No se atraviesan** (Guille lo marcó en la demo): cada tarjeta está en su propio espacio 3D (`.cam`) con la misma cámara, apiladas de atrás hacia adelante (A, C, D). La de adelante tapa a la de atrás y le proyecta una **sombra de contacto** (`.ghost`: copia oscura y difusa de la tarjeta, 24 px más abajo). Las caras llevan un grano de papel muy sutil.
- **Versiones fijas de las tarjetas** (secciones `.p4` y `.p5`, archivos `aicia-proyectos-fc-barber-estatica-1/2.png`): quedan guardadas por si Guille las prefiere al video; no se exportan. Son tarjetas que él diseñó en Canva con forma de billete de $2.000.
  - `aicia-proyectos-fc-barber-estatica-1.png`: "FC Barber Shop · Tarjetas" / "¿Pensaste que era *plata?*" (el gancho de la propia tarjeta) / "De un lado, un billete de $2.000. Del otro, todo para **reservar el turno.**". La tarjeta horizontal de frente (el billete) flota inclinada sobre el dorso negro.
  - `aicia-proyectos-fc-barber-estatica-2.png`: "Del otro lado, *el turno.*" / "Teléfono, Instagram, las dos direcciones y un QR **para reservar.**". Las dos verticales de dorso (blanca y negra), paradas y en perspectiva.
  - Las tarjetas son objetos `.deck .cd` con perspectiva 3D, sombra larga, brillo satinado y filo de luz. Los colores del diseño de Guille no se tocan.
  - Los PDF originales están en `assets/fc-barber-tarjetas/` (horizontal y vertical, con dorso blanco y negro). `bash preparar-tarjetas-barber.sh` saca cada cara a JPG (necesita pdftoppm y ffmpeg).
- **Proyectos · Próximamente** (`aicia-proyectos-04-proximamente.png`, sección `.p3`): va al final, así la destacada no muestra un solo proyecto, como pidió Guille.
  - "Próximamente" / "Lo que *se viene.*" / "Más proyectos, testimonios y novedades."
  - Debajo van 3 tarjetas de vidrio compactas con ícono y la marca "pronto": Nuestra página web, Testimonios y Más proyectos.
  - Abajo, como imagen protagonista, el **filósofo de mármol con la laptop** que pasó Guille. Va en blanco y negro (`.subj.mono`), con tinte índigo y luz de borde.
    - `assets/filosofo-laptop.png` sale de `filosofo-laptop-original.jpg` (fondo blanco) con `preparar-filosofo.mjs`.
    - Ese script hace un relleno desde el borde más los huecos blancos grandes, suaviza el borde quitándole el blanco (así no queda halo) y agranda al doble.
  - Sin fechas ni números, para no prometer nada que no esté.
  - Cuando haya testimonios o proyectos nuevos, se reemplaza.
- Tarjetas de FC Barber Shop tipo billete de $2.000: ya están en Proyectos (ver arriba). Ojo: el frente reproduce un billete real.
- Pendiente opcional: una segunda historia de Bs.As. Top en imagen (por ejemplo, el paso de reservas en otro mockup). Máximo 2 historias por proyecto.
- Opcional: video de demo de un proyecto si Guille pasa grabaciones de pantalla.

## Web de Aicia (`aicia-web/`)
- Pedido de Guille: "armar la página de Aicia con el estilo que venimos manejando". Es **una sola página** (`index.html`), estática, sin dependencias: HTML + CSS + un poco de JS. Se puede subir tal cual a Vercel, Netlify o GitHub Pages.
- Vista previa en vivo (artifact privado de Guille): https://claude.ai/artifact/FhFKDhWpoyxtcHj5SnL2jE. Para actualizarla, se genera la versión para el visor (sin `<head>`, con las fuentes embebidas en base64 y el título "Web de Aicia") y se publica con la misma ruta.
- **Mismo estilo que las historias**: noche índigo, una luz índigo por sección con la grilla que se desvanece, grano, vidrio (`.glass`), íconos tipo app (superelipse con `ap-indigo/ap-light/ap-deep`), Geist + una frase en Instrument Serif itálica lavanda por titular, recortes con tinte índigo y luz de borde (`.subj`).
  - Las luces de cada sección se extienden 160 px arriba y abajo y se funden con la vecina: no hay cortes entre secciones. Las secciones no aíslan capas a propósito, así todas las luces quedan debajo de todo el texto.
- **Secciones y textos** (todos salen de las historias aprobadas, nada inventado):
  1. Inicio: "Agencia de IA y automatizaciones" / "Tu negocio, en *automático.*" / "Creamos agentes de IA, automatizaciones, webs y apps **a medida de tu negocio**, para que responda, agende y haga seguimiento solo." / botones "Pedí tu demo" (WhatsApp) y "Ver servicios". A la derecha, la escena de la historia "¿Qué hacemos?": mano robot + iPhone con el chat de WhatsApp y la notificación "Turno agendado". El chat **se anima una vez** (Martina "escribiendo…", los mensajes entran de a uno) y lleva la nota "Vista de ejemplo".
  2. El problema: "Tu negocio, todo *a mano.*" + las 4 notificaciones de la historia 2, sobre la cabeza de documentos.
  3. Servicios: "Hacemos que tu negocio *funcione solo.*" + 3 tarjetas (Asistentes de IA, Automatizaciones, Webs y apps) con sus frases aprobadas y 3 ejemplos cada una + "Se conecta con lo que ya usás" (WhatsApp, Instagram, Facebook, Gmail, Google Calendar, Google Sheets).
  4. Cómo trabajamos: "Tres pasos. Sin *vueltas.*" (Diagnóstico, Implementación, Resultados).
  5. Clientes: "Ellos ya *dieron el paso.*" + apretón robot-humano en blanco y negro + los 5 logos con nombre y rubro.
  6. Proyectos: "Reservas *online.*" con el video de Bs.As. Top (versión web liviana) y los 5 pasos de la reserva + "Más proyectos, muy pronto."
  7. Contacto: "¿Lo vemos para tu *negocio?*" + "Pedí tu demo" + WhatsApp +598 91 284 655 e Instagram @aicia_ia, con la mano robot señalando el botón.
  8. Pie: logo, secciones, contacto y "aicia" gigante en degradé blanco → lavanda (como el logo de texto).
- Todos los "Pedí tu demo" abren WhatsApp con el mensaje "Hola Aicia! Quiero pedir una demo para mi negocio."
- Celular primero: en el teléfono todo va en una columna, los clientes en lista y la escena del chat se achica con `--k`.
- `bash preparar-assets.sh` genera `assets/` desde `historias/`: recortes a WebP (los chicos al doble con lanczos), logos de clientes, el video a 720×1280 (~1,7 MB) y su portada.
- `node capturas.mjs` saca capturas de escritorio (1440) y celular (390) en `capturas/` (no va al repo) y controla desbordes e imágenes sin cargar.
- Pendiente: dominio, imagen para compartir (og:image) y, si Guille quiere, formulario o Google Analytics. Estado: **primera versión, esperando el OK de Guille**.
