# Cliente Workana · A. Servicios Integrales Catoira

Primer cliente de Aicia cerrado por Workana. Objetivo: entregar impecable y conseguir 5 estrellas.

## Cliente
- Fernando Catoira (Uruguay), "Gestor técnico comercial". Emprendimiento que recién arranca, sin presencia online (Instagram vacío).
- Nombre comercial (según su brief): **A. Servicios Integrales Catoira**.
- Zonas: Montevideo y Ciudad de la Costa.
- Contacto que figura en sus piezas: Tel. 098 965 054 · a.servicios.integralesf@gmail.com. Web "en construcción" (no publicar la URL).
- Instagram: @a.servicios.integrales (https://www.instagram.com/a.servicios.integrales/). Estado al 19/11 (`insumos/instagram-hoy-19-11.png`):
  - 1 publicación (el flyer horizontal de grifería: en la grilla 3:4 queda cortado a los costados, no se lee), 3 seguidores, 6 seguidos.
  - Sin nombre visible, sin bio, sin categoría, sin botón de contacto ni enlace (no parece cuenta profesional), sin destacadas.
  - Foto de perfil: el logo completo con texto, que en el círculo chico no se lee. Conviene usar solo el símbolo.
  - Tiene Threads vinculado.
- Proyecto Workana (https://www.workana.com/app/job/gestor-de-redes-sociales-para-optimizacion-de-instagram-y-whatsapp-business): "Gestor de Redes Sociales para Optimización de Instagram y WhatsApp Business". UY$ 1.999,87. Comisión por cierre acordada (condiciones a confirmar).
- Alcance acordado por llamada (18/11): perfil de Facebook, Instagram y WhatsApp Business. Anuncios: a confirmar si entran ahora o en una segunda etapa.

## Lo que pidió en Workana (`insumos/workana-proyecto.png`)
- Presupuesto publicado: UYU 2.000–4.000. Plazo: no definido. Categoría: Community Management, "pocas publicaciones por semana o marca en crecimiento".
- Texto: "optimizar la presencia en Instagram y WhatsApp Business, así como **configurar campañas sencillas de mensajes directos para generar consultas reales** de clientes". Busca alguien "práctico y orientado a resultados", que transforme la actividad en redes "en oportunidades de negocio concretas".
- O sea: además del perfil lindo, **espera un sistema para conseguir consultas**. El kit tiene que traer una campaña de mensajes directos lista para usar (a quién escribirle, guiones y seguimientos, sobre todo para administradoras de edificios e inmobiliarias, su cliente B2B), y cómo medir cuántas consultas salen.

## Insumos (`insumos/`)
- `brief-marca-ventas.html`: **fuente principal**. Identidad, manifiesto, tono, servicios (sanitaria, construcción/reformas, visita diagnóstica, paquetes B2B), bio sugerida, pilares de contenido, 5 anuncios, guion de WhatsApp.
- `flyers/01–11`: 11 flyers horizontales que ya tiene (uno por servicio + un collage). Usan **fotos de banco o hechas con IA**, no trabajos reales.
- `logo-chico-con-contacto.jpg`: el logo (casa con herramientas y flecha, verde azulado y azul petróleo). Solo hay esta versión chica: hay que redibujarlo o pedir el original.
- `flyer-vertical-servicios.jpg`: flyer vertical "Soluciones Integrales para su Hogar y Comercio".
- `tarjeta-mockup-plantilla.jpg`: **no usar los datos**: tiene un teléfono +34 y una dirección de Madrid de plantilla.

## Reglas
- **Precios**: nunca publicar tarifas ni el valor de la visita (regla del brief). Siempre "Presupuesto a medida" / "Consultar según diagnóstico". El tope de la visita es interno: no va en ninguna pieza.
- **No inventar**: trabajos, reseñas, años de experiencia, garantías, horarios. Lo que falte va como "a confirmar" o un espacio para completar.
- **Trabajos reales**: no hay fotos de trabajos propios. La destacada "Trabajos" no se arma con fotos de banco como si fueran suyas: se deja la estructura lista y se le pide a Fernando fotos reales (antes / después).
- Tono (del brief): técnico, cercano, honesto, resolutivo. Nada de "el mejor precio", "rápido y barato", "somos los mejores".
- Toda la comunicación y la entrega van por el chat de Workana. Nunca pedir contraseñas.
- Guille no entra a las cuentas: el entregable es un **kit + guía paso a paso** para que Fernando lo cargue él.
- Español rioplatense (Uruguay), sin sonar a IA. Uruguay: "ustedes" (no "vosotros").

## Kit de presencia digital (entregable, esperando el OK de Guille)
- **Identidad** (la de su logo, no la de Aicia): noche petróleo #04141C, azul petróleo #0A2C4E, verde azulado #13857F, agua #5FD0C1 (acentos) y hueso #EEF3F1. Montserrat 800 en títulos (la letra del logo) con una frase en verde agua; Inter en textos. Motivo "plano técnico": grilla milimetrada que se desvanece, marcas de corte, vidrio, íconos de contorno e ilustraciones de línea propias (caño con parche y "origen"; humedad que entra por la junta de la azotea). Sin fotos de banco.
- **Símbolo en vector**: `logo/limpiar-simbolo.py` lo dibuja a mano (rectas y Bézier) sobre las medidas de `logo/trazar-simbolo.py` (trazado del JPG) → `logo/simbolo-limpio.json` + SVG (degradé original, blanco, azul petróleo). En fondo oscuro se usa el degradé luminoso (#3E8FE0 → #2FB3A5 → #8FE8DB).
- **Piezas** (`piezas/piezas.html` → `node clientes/catoira/render.mjs piezas/piezas.html [--prueba] [--solo texto]`, al doble y con lanczos, con QA de zona segura): perfil (oscuro y claro), 4 portadas de destacadas, 12 historias (Servicios 5, Trabajos 1 + plantilla que NO se publica, Cómo trabajamos 4, Contacto 1), 3 publicaciones, portada de Facebook 1702×630 (851×315 al doble; zona tapada por la foto de perfil abajo a la izquierda) y de WhatsApp Business 1920×1080 (medidas de aicia-whatsapp: círculo en 960,757 r 373), y 10 imágenes de catálogo. Los textos de historias y catálogo salen de `kit/textos.js`.
- **Textos** (`kit/textos.js`, fuente única → `kit/textos-para-copiar.txt` con `node clientes/catoira/kit/armar-textos.cjs`): perfil de WhatsApp, bienvenida, catálogo, bio de IG (138/150), 3 descripciones de publicaciones, Facebook y Google.
- **Guille (19/11): Fernando se encarga de responder, hacer seguimiento y mandar mensajes.** Se sacaron del kit las respuestas rápidas, las etiquetas, la campaña de mensajes directos (guiones, seguimientos, "¿cuánto sale?", recomendaciones y reseñas) y la planilla de prospección. Solo queda el **mensaje de bienvenida de WhatsApp** (Guille sacó también la ausencia y las respuestas automáticas de Instagram y Facebook). Portada del PDF: "Más consultas, *más clientes.*" y "Preparado por Guillermo García" (no Aicia).
- **Segunda ronda de Guille (19/11)**:
  - Nombre en WhatsApp: "Fernando Catoira · A. Servicios Integrales" (es su número personal y el del negocio). Bienvenida: "¡Hola! Gracias por escribir a A. Servicios Integrales Catoira. Te respondemos a la brevedad." Sitio web: solo el Instagram.
  - Fuera del PDF: el apartado de seguridad, los avisos de "una sola vía" y "cambiás de celular", la página de respuestas automáticas de IG/FB, el plan de 30 días, los guiones y los anuncios. La página de crecimiento habla solo de reels y recomienda sumar a alguien especializado. La última página ("Todo se puede ajustar") dice que se armó con lo que había y que Fernando puede cambiar servicios, nombre y textos. Las confirmaciones quedan solo en el mensaje de Workana.
  - Carpeta: todo en PNG (el logo sale de `node clientes/catoira/logo/exportar-png.mjs` → `logo/png/`), historias en una carpeta por destacada, sin la plantilla de Trabajos ni la portada de Facebook "prueba". `textos-para-copiar.txt` en texto plano, con cada texto entre "COPIÁ DESDE ACÁ" y "HASTA ACÁ".
- **PDF** (`kit/kit.html` → `node clientes/catoira/kit/render-pdf.mjs [--capturas]`, 13 páginas A4, usa copias livianas de `kit/img/` que arma `kit/achicar-imagenes.py`). Pasos verificados en `kit/fuentes-verificadas.md`; lo no confirmado va marcado "puede variar".
- **Reel regalo** (`reel/reel.html`, 18,4 s, 1080×1920, 60 fps): gancho de la humedad → "Pintar no es solucionar" → "No ponemos parches" → servicios → el símbolo se arma + "Escribinos · 098 965 054". Motor: copia de `historias/clientes-proyectos/render-timeline.mjs` (sirve solo su carpeta, por eso las fuentes y el JSON del símbolo están copiados). Final: `node render-timeline.mjs reel.html --fresh --fps 60 --sub 4 --poster 7.4 --crf 14`.
- **Entrega**: `python3 clientes/catoira/armar-entrega.py` → `entrega/kit-catoira.zip`. Mensaje para Fernando: `mensaje-fernando-workana.md`.
- Ojo: los nombres de los flyers no coinciden con su contenido, y dos dicen "Garantía por escrito" / "Calidad garantizada": está en la lista de confirmaciones.
