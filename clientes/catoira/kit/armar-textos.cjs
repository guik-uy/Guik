// Genera textos-para-copiar.txt desde textos.js (la misma fuente que el PDF). Uso: node clientes/catoira/kit/armar-textos.cjs
// Texto plano, para abrirlo en cualquier celular o compu: cada texto para pegar va entre "COPIÁ DESDE ACÁ" y "HASTA ACÁ".
const T = require('./textos.js'), fs = require('fs'), path = require('path');
const LINEA = '='.repeat(56);
const red = (n, titulo, donde) => `\n\n${LINEA}\n${n}. ${titulo}\n${LINEA}\nDónde se carga: ${donde}\n`;
// Texto para pegar tal cual
const copiar = (campo, txt) => `\n▶ ${campo.toUpperCase()}\n------ COPIÁ DESDE ACÁ ------\n${txt}\n------ HASTA ACÁ ------\n`;
// Indicación (no se pega)
const guia = (campo, txt) => `\n▶ ${campo.toUpperCase()} (no se pega: es una indicación)\n${txt}\n`;

let m = `TEXTOS PARA COPIAR Y PEGAR
A. Servicios Integrales Catoira

Cómo usar este archivo:
1. Buscá la red que estás cargando (WhatsApp, Instagram, Facebook o Google).
2. Copiá solo lo que está entre "COPIÁ DESDE ACÁ" y "HASTA ACÁ".
3. Lo que está [entre corchetes] lo completás vos.
4. Los pasos con fotos están en la guía PDF ("0. Empezá acá").`;

m += red(1, 'WHATSAPP BUSINESS', 'Ajustes → Herramientas para la empresa → Perfil de empresa');
m += copiar('Nombre', T.wa.nombre);
m += guia('Categorías', T.wa.categorias);
m += copiar('Descripción', T.wa.descripcion);
m += guia('Dirección', T.wa.direccion);
m += guia('Horario', T.wa.horario);
m += copiar('Correo', T.wa.email);
m += copiar('Sitio web', T.wa.web);
m += `\n\n--- Mensaje de bienvenida ---\nDónde se carga: Herramientas para la empresa → Mensaje de bienvenida → activalo → destinatarios: Todos\n`;
m += copiar('Mensaje de bienvenida', T.wa.bienvenida);
m += `\n\n--- Catálogo (10 servicios, sin precio) ---\nDónde se carga: Herramientas para la empresa → Catálogo → Agregar artículo.\nPara cada uno: la imagen de la carpeta 3. WhatsApp › Catálogo (mismo número y nombre), el nombre y la descripción. El precio, vacío.\nSi algún servicio no lo hacés, salteálo.\n`;
T.wa.catalogo.forEach(([n, d], i) => { m += copiar(`Servicio ${i + 1} · nombre`, n) + copiar(`Servicio ${i + 1} · descripción`, d); });

m += red(2, 'INSTAGRAM', 'En tu perfil → Editar perfil');
m += copiar('Nombre', T.ig.nombre);
m += guia('Usuario', T.ig.usuario);
m += guia('Categoría', T.ig.categoria);
m += copiar('Presentación (bio)', T.ig.bio);
m += copiar('Enlace', T.ig.enlace.replace(/ \(.*\)$/, ''));
m += guia('Botones de contacto', T.ig.botones);
m += `\n\n--- Descripción de las 3 publicaciones ---\nSe pega al subir cada imagen de la carpeta 2. Instagram › Publicaciones, en el espacio para escribir la descripción.\nSubilas en este orden: primero la 3, después la 2 y al final la 1.\n`;
T.ig.posts.forEach(([n, t]) => { m += copiar(`${n} · descripción`, t); });

m += red(3, 'FACEBOOK', 'Página de empresa → Editar');
m += copiar('Nombre de la página', T.fb.nombre);
m += guia('Categorías', T.fb.categorias);
m += copiar('Presentación', T.fb.bio);
m += guia('Botón', T.fb.boton);

m += red(4, 'GOOGLE (Perfil de Empresa)', 'google.com/business → Editar perfil');
m += copiar('Nombre', T.google.nombre.replace(/ \(.*\)$/, ''));
m += guia('Nombre', 'Solo el nombre real: Google no permite sumarle palabras clave.');
m += guia('Categoría', T.google.categoria);
m += guia('Zonas de servicio', T.google.zonas);
m += copiar('Descripción', T.google.descripcion);

fs.writeFileSync(path.join(__dirname, 'textos-para-copiar.txt'), m.trim() + '\n');
console.log('ok', m.length);
