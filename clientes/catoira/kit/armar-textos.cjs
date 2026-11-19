// Genera textos-para-copiar.md desde textos.js (la misma fuente que el PDF). Uso: node clientes/catoira/kit/armar-textos.cjs
const T = require('./textos.js'), fs = require('fs'), path = require('path');
const b = t => '```\n' + t + '\n```\n';
let m = `# Textos listos para copiar · A. Servicios Integrales Catoira\n\nCopiá lo que está dentro de cada recuadro. Lo que está [entre corchetes] lo completás vos.\n\n`;
m += `## WhatsApp Business\n\n**Nombre:** ${T.wa.nombre}\n\n**Categorías:** ${T.wa.categorias}\n\n**Descripción:**\n${b(T.wa.descripcion)}\n**Dirección:** ${T.wa.direccion}\n\n**Horario:** ${T.wa.horario}\n\n**Correo:** ${T.wa.email}\n\n**Sitio web:** ${T.wa.web}\n\n`;
m += `### Mensaje de bienvenida\n${b(T.wa.bienvenida)}\n### Mensaje de ausencia\n${b(T.wa.ausencia)}\n### Respuestas rápidas\n\n`;
for (const [k, c, t] of T.wa.rapidas) m += `**${k}** · ${c}\n${b(t)}\n`;
m += `### Etiquetas\n\n` + T.wa.etiquetas.map(([n, d]) => `- **${n}**: ${d}`).join('\n') + '\n\n### Catálogo (sin precio)\n\n';
T.wa.catalogo.forEach(([n, d], i) => m += `${i + 1}. **${n}**: ${d}\n`);
m += `\n## Instagram\n\n**Nombre:** ${T.ig.nombre}\n\n**Usuario:** ${T.ig.usuario}\n\n**Categoría:** ${T.ig.categoria}\n\n**Biografía:**\n${b(T.ig.bio)}\n**Enlace:** ${T.ig.enlace}\n\n**Botones de contacto:** ${T.ig.botones}\n\n### Textos de las 3 publicaciones\n\n`;
for (const [n, t] of T.ig.posts) m += `**${n}**\n${b(t)}\n`;
m += `## Facebook\n\n**Nombre:** ${T.fb.nombre}\n\n**Categorías:** ${T.fb.categorias}\n\n**Presentación:**\n${b(T.fb.bio)}\n**Botón:** ${T.fb.boton}\n\n`;
m += `## Perfil de Empresa en Google\n\n**Nombre:** ${T.google.nombre}\n\n**Categoría:** ${T.google.categoria}\n\n**Zonas:** ${T.google.zonas}\n\n**Descripción:**\n${b(T.google.descripcion)}\n`;
m += `## Campaña de mensajes directos\n\n`;
for (const [n, t] of T.campana.guiones) m += `**${n}**\n${b(t)}\n`;
fs.writeFileSync(path.join(__dirname, 'textos-para-copiar.md'), m); console.log('ok', m.length);
